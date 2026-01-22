import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as userService from "@/services/user.service";

// Mock the auth middleware to accept our test tokens
jest.mock('@/middlewares/auth.middleware', () => ({
  auth: (req: any, res: any, next: any) => {
    // Mock user for tests
    req.user = {
      data: {
        username: config.auth.teacher_username,
        role: 'teacher'
      }
    };
    next();
  },
  roleAllowed: (req: any, res: any, next: any) => {
    next();
  },
  optionalAuth: (req: any, res: any, next: any) => {
    next();
  }
}));

/**
 * Authenticate with Keycloak and get bearer token
 * For tests, we'll use a mock token since Keycloak service isn't running
 */
async function getKeycloakToken(): Promise<string> {
  // Always use mock token for tests - don't try real Keycloak authentication
  logger.info('Using mock token for tests');
  return 'mock-test-bearer-token';
}

/**
 * HTTP API tests for user controller endpoints.
 */
describe("User Controller /users", () => {
  let testUserId: number;
  let bearerToken: string;

  beforeAll(async () => {
    try {
      // Fix config paths for test environment
      const originalAppFolder = config.appFolder;
      config.appFolder = process.cwd(); // Use current working directory
      config.db.sql_files_path = config.appFolder + "/" + config.db.sql_files_subpath;
      config.db.views_sql_file = config.db.sql_files_path + "/" + config.db.views_sql_filename;
      
      await db.sequelize.sync({ force: true });
      
      // Get Keycloak authentication token
      bearerToken = await getKeycloakToken();
      logger.info(`Obtained Keycloak bearer token for tests :${bearerToken}`);
      logger.info('Keycloak authentication successful');
      
      // Restore original config after setup
      config.appFolder = originalAppFolder;
    } catch (err) {
      logger.error({ err }, "Setup failed");
      throw err;
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /users returns empty array initially", async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.User>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /users creates a user", async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        username: "testuser",
        email: "test@example.com",
        role: "student"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.User> = response.body;
    expect(data.user_id).toBeDefined();
    expect(data.username).toBe("testuser");
    expect(data.email).toBe("test@example.com");
    expect(data.role).toBe("student");
    
    testUserId = data.user_id;
  });

  it("POST /users creates another user", async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        username: "anotheruser",
        email: "another@example.com",
        role: "teacher"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.username).toBe("anotheruser");
  });

  it("GET /users returns all users after creation", async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.User>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /users?username=X returns user by username", async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`)
      .query({ username: "testuser" });

    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.User> = response.body;
    expect(data.username).toBe("testuser");
    expect(data.email).toBe("test@example.com");
  });

  it("GET /users?username=X returns 404 for non-existent username", async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`)
      .query({ username: "nonexistent" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("DELETE /users/:id deletes user by id", async () => {
    const response = await request(app)
      .delete(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /users/:id returns 404 for non-existent user", async () => {
    const response = await request(app)
      .delete('/users/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it("GET /users handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(userService, 'getAllUsers').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /users handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(userService, 'createUser').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        username: "testuser",
        email: "test@example.com",
        role: "student"
      });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});
