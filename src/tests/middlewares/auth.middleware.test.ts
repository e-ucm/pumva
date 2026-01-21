import { Request, Response, NextFunction } from 'express';

// Mock the user service
const mockValidateJWT = jest.fn();
const mockGetUserByUsername = jest.fn();

jest.mock('@/services/user.service', () => ({
  validateJWT: mockValidateJWT,
  getUserByUsername: mockGetUserByUsername
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}));

// Mock path and __dirname for ESM
jest.mock('path', () => {
  const api = {
    resolve: jest.fn().mockReturnValue('/mock/api.yaml'),
    dirname: jest.fn().mockReturnValue('/mock/dir'),
    join: jest.fn((...args: any[]) => args.join('/'))
  };
  return {
    ...api,
    default: api
  };
});

jest.mock('url', () => ({
  fileURLToPath: jest.fn().mockReturnValue('/mock/file.ts')
}));

jest.mock('jsonwebtoken', () => {
  const api = {
    decode: jest.fn().mockReturnValue({
      exp: 1769007331,
      iat: 1769003731,
      auth_time: 1769003731,
      jti: 'fcd0f5fb-926f-49ca-bd3f-11852be8558c',
      iss: 'https://sso.simva-beta2.e-ucm.es/realms/simva',
      aud: 'account',
      sub: '178bffdf-bdbc-45d5-80fa-ac467ea31580',
      typ: 'Bearer',
      azp: 'simva',
      sid: 'a581edce-8fbd-4ce8-bde5-e2d76c9381d4',
      'allowed-origins': ['https://simva-beta2.e-ucm.es'],
      realm_access: {
        roles: ['norole', 'teacher', 'default-roles-simva', 'student', 'offline_access', 'uma_authorization', 'teaching-assistant']
      },
      resource_access: {
        account: { roles: ['manage-account', 'manage-account-links', 'view-profile'] }
      },
      scope: 'openid profile email',
      email_verified: false,
      name: 'teacher',
      preferred_username: 'testuser',
      given_name: 'teacher',
      locale: 'es',
      family_name: 'teacher',
      email: 'teacher@simva-beta2.e-ucm.es'
    })
  };
  return {
    ...api,
    default: api
  };
});

// Mock fs for API spec loading
jest.mock('fs', () => ({
  default: {
    readFileSync: jest.fn().mockReturnValue(`
openapi: 3.0.3
paths:
  /users:
    get:
      tags:
        - Admins
        - Teachers
    post:
      tags:
        - Admins
        - Teachers
  /games:
    get:
      tags:
        - Admins
        - Teachers
  /health:
    get:
      tags:
        - Health
`)
  }
}));

// Mock yaml
jest.mock('yaml', () => ({
  default: {
    parse: jest.fn().mockReturnValue({
      paths: {
        '/users': {
          get: { tags: ['Admins', 'Teachers'] },
          post: { tags: ['Admins', 'Teachers'] }
        },
        '/games': {
          get: { tags: ['Admins', 'Teachers'] }
        },
        '/health': {
          get: { tags: ['Health'] }
        }
      }
    })
  }
}));

// Import the Authenticator after mocks are declared
import { Authenticator } from '@/middlewares/auth.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      query: {},
      originalUrl: '/users',
      method: 'GET'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    // Reset mocks and implementations between tests to avoid leaked once() queues
    jest.clearAllMocks();
    mockValidateJWT.mockReset();
    mockGetUserByUsername.mockReset();
  });

  describe('Authentication', () => {
    it('should reject requests without authorization header', async () => {
      await Authenticator.auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'No authorization header' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid Bearer token format', async () => {
      mockRequest.headers = { authorization: 'Invalid token' };

      await Authenticator.auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Auth header is not a valid Bearer.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid JWT', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid.jwt.token' };
      mockValidateJWT.mockRejectedValueOnce(new Error('Invalid token'));
      mockGetUserByUsername.mockResolvedValueOnce(null);

      await Authenticator.auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: 'JWT token is not valid.',
        error: expect.any(Error)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests when user is not found', async () => {
      mockRequest.headers = { authorization: 'Bearer valid.jwt.token' };
      mockValidateJWT.mockResolvedValueOnce({
        data: { username: 'testuser' }
      });
      mockGetUserByUsername.mockResolvedValueOnce(null);

      await Authenticator.auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Username not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should proceed to role authorization for valid tokens', async () => {
      const mockUser = {
        toJSON: jest.fn().mockReturnValue({
          user_id: 1,
          username: 'testuser',
          role: 'admin'
        })
      };

      mockRequest.headers = { authorization: 'Bearer valid.jwt.token' };
      mockRequest.originalUrl = '/health';
      
      mockValidateJWT.mockResolvedValueOnce({
        data: { username: 'testuser', role: 'admin' }
      });
      mockGetUserByUsername.mockResolvedValueOnce(mockUser);

      await Authenticator.auth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockValidateJWT).toHaveBeenCalledWith('valid.jwt.token');
      expect(mockGetUserByUsername).toHaveBeenCalledWith('testuser');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Role Authorization', () => {
    beforeEach(() => {
      // Reinitialize paths for each test
      Authenticator.initPaths();
    });

    it('should allow access to routes matching admin role', async () => {
      (mockRequest as any).user = {
        data: { role: 'admin' }
      };
      mockRequest.originalUrl = '/users';
      mockRequest.method = 'GET';

      await Authenticator.roleAllowed(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access to routes matching teacher role', async () => {
      (mockRequest as any).user = {
        data: { role: 'teacher' }
      };
      mockRequest.originalUrl = '/users';
      mockRequest.method = 'GET';

      await Authenticator.roleAllowed(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access to routes not matching user role', async () => {
      (mockRequest as any).user = {
        data: { role: 'student' }
      };
      mockRequest.originalUrl = '/users';
      mockRequest.method = 'GET';

      await Authenticator.roleAllowed(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access to health routes for any role', async () => {
      (mockRequest as any).user = {
        data: { role: 'student' }
      };
      mockRequest.originalUrl = '/health';
      mockRequest.method = 'GET';

      await Authenticator.roleAllowed(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Optional Authentication', () => {
    it('should continue without authentication when no token provided', async () => {
      await Authenticator.optional(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user).toBeUndefined();
    });

    it('should attach user data when valid token provided', async () => {
      const mockUser = {
        toJSON: jest.fn().mockReturnValue({
          user_id: 1,
          username: 'testuser',
          role: 'teacher'
        })
      };

      mockRequest.headers = { authorization: 'Bearer valid.jwt.token' };
      
      mockValidateJWT.mockResolvedValueOnce({
        data: { username: 'testuser', role: 'teacher' }
      });
      mockGetUserByUsername.mockResolvedValueOnce(mockUser);

      await Authenticator.optional(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user).toBeDefined();
      expect((mockRequest as any).user.data.username).toBe('testuser');
    });

    it('should continue without authentication when token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid.jwt.token' };
      mockValidateJWT.mockRejectedValueOnce(new Error('Invalid token'));

      await Authenticator.optional(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user).toBeUndefined();
    });
  });
});