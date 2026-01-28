import { validateJWT, getUsersWithFilter } from '@/services/users/user.service';
import jwt from 'jsonwebtoken';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the config
jest.mock('@/lib/config', () => ({
  config: {
    auth: {
      jwt_secret: 'test-secret-key'
    }
  }
}));

// Mock the KeycloakKeyManager
jest.mock('@/lib/keycloakKeyManager', () => ({
  KeycloakKeyManager: {
    isEnabled: jest.fn().mockReturnValue(false)
  }
}));

// Mock the db and other user service functions
jest.mock('@/lib/db', () => ({
  db: {
    Tables: {
      User: {
        findAll: jest.fn(),
        findOne: jest.fn()
      }
    }
  }
}));

describe('User Service - Authentication Functions', () => {
  describe('validateJWT', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully validate a JWT with secret verification', async () => {
      const testPayload = {
        preferred_username: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      const result = await validateJWT(token);

      expect(result.sql.username).toBe('testuser');
      //expect(result.sql.role).toBe('student');
    });

    it('should successfully decode JWT when verification fails', async () => {
      const testPayload = {
        preferred_username: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      // Sign with different secret
      const token = jwt.sign(testPayload, 'different-secret');

      const result = await validateJWT(token);

      expect(result.sql.username).toBe('testuser');
      //expect(result.sql.role).toBe('user');
    });

    it('should handle preferred_username claim', async () => {
      const testPayload = {
        preferred_username: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      const result = await validateJWT(token);

      expect(result.sql.username).toBe('testuser');
    });

    it('should handle sub claim', async () => {
      const testPayload = {
        sub: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      const result = await validateJWT(token);

      expect(result.sql.username).toBe('testuser');
    });

    it('should reject expired tokens', async () => {
      const testPayload = {
        preferred_username: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      await expect(validateJWT(token)).rejects.toThrow('Token has expired');
    });

    it('should reject tokens without username identification', async () => {
      const testPayload = {
        email: 'testuser@test.com',
        realm_access: {
          roles: ['student']
        },
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      await expect(validateJWT(token)).rejects.toThrow('Token missing required user identification');
    });

    it('should reject invalid tokens', async () => {
      await expect(validateJWT('invalid.token')).rejects.toThrow('JWT validation failed');
    });

    it('should handle realm_access claims', async () => {
      const testPayload = {
        preferred_username: 'testuser',
        email: 'testuser@test.com',
        realm_access: {
          roles: ['teacher', 'researcher']
        },
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = jwt.sign(testPayload, 'test-secret-key');

      const result = await validateJWT(token);

      expect(result.sso.realm_access.roles).toContain('teacher');
      expect(result.sso.realm_access.roles).toContain('researcher');
    });
  });

  describe('getUsersWithFilter', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return filtered user when username is provided', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      // Mock the db call
      const mockFindOne = require('@/lib/db').db.Tables.User.findOne;
      mockFindOne.mockResolvedValueOnce(mockUser);

      const result = await getUsersWithFilter({ username: 'testuser' });

      expect(result).toEqual([mockUser]);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    });

    it('should return empty array when user not found', async () => {
      const mockFindOne = require('@/lib/db').db.Tables.User.findOne;
      mockFindOne.mockResolvedValueOnce(null);

      const result = await getUsersWithFilter({ username: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('should return all users when no filter is provided', async () => {
      const mockUsers = [
        { user_id: 1, username: 'user1' },
        { user_id: 2, username: 'user2' }
      ];

      const mockFindAll = require('@/lib/db').db.Tables.User.findAll;
      mockFindAll.mockResolvedValueOnce(mockUsers);

      const result = await getUsersWithFilter();

      expect(result).toEqual(mockUsers);
      expect(mockFindAll).toHaveBeenCalled();
    });

    it('should return all users when empty filter is provided', async () => {
      const mockUsers = [
        { user_id: 1, username: 'user1' },
        { user_id: 2, username: 'user2' }
      ];

      const mockFindAll = require('@/lib/db').db.Tables.User.findAll;
      mockFindAll.mockResolvedValueOnce(mockUsers);

      const result = await getUsersWithFilter({});

      expect(result).toEqual(mockUsers);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });
});