import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as technologyService from "@/services/games/technology.service";

// Mock the auth middleware to accept our test tokens
jest.mock('@/middlewares/auth.middleware', () => ({
  auth: (req: any, res: any, next: any) => {
    // Mock user for tests
    req.user = {
      data: {
        username: config.sso.teacher_username,
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
 * HTTP API tests for technology controller endpoints.
 */
describe("Technology Controller /technologies", () => {
  let testTechnologyId: number;
  let bearerToken: string;

  beforeAll(async () => {
    try {
      // Fix config paths for test environment
      const originalAppFolder = config.appFolder;
      config.appFolder = process.cwd();
      config.db.sql_files_path = config.appFolder + "/" + config.db.sql_files_subpath;
      config.db.views_sql_file = config.db.sql_files_path + "/" + config.db.views_sql_filename;
      
      await db.sequelize.sync({ force: true });
      
      
      // Get Keycloak authentication token
      bearerToken = await getKeycloakToken();
      logger.info(`Obtained Keycloak bearer token for tests`);
      
      // Restore original config after setup
      config.appFolder = originalAppFolder;
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /technologies returns empty array initially", async () => {
    const response = await request(app)
      .get('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.Technology>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /technologies creates a technology", async () => {
    const response = await request(app)
      .post('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        technology: "Unity"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology_id).toBeDefined();
    expect(data.technology).toBe("Unity");
    
    testTechnologyId = data.technology_id;
  });

  it("POST /technologies creates another technology", async () => {
    const response = await request(app)
      .post('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        technology: "Unreal Engine"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.technology).toBe("Unreal Engine");
  });

  it("GET /technologies returns all technologies after creation", async () => {
    const response = await request(app)
      .get('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.Technology>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /technologies/:id returns technology by id", async () => {
    const response = await request(app)
      .get(`/technologies/${testTechnologyId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology_id).toBe(testTechnologyId);
    expect(data.technology).toBe("Unity");
  });

  it("GET /technologies/:id returns 404 for non-existent technology", async () => {
    const response = await request(app)
      .get('/technologies/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Technology not found');
  });

  it("PUT /technologies/:id updates technology", async () => {
    const response = await request(app)
      .put(`/technologies/${testTechnologyId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        technology: "Unity 3D"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology).toBe("Unity 3D");
  });

  it("DELETE /technologies/:id deletes technology by id", async () => {
    const response = await request(app)
      .delete(`/technologies/${testTechnologyId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /technologies/:id returns 404 for non-existent technology", async () => {
    const response = await request(app)
      .delete('/technologies/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Technology not found');
  });

  it("GET /technologies handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(technologyService, 'getTechnologies').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /technologies handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(technologyService, 'createTechnology').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/technologies')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ technology: "Test Tech" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /technologies/:id handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(technologyService, 'updateTechnology').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put('/technologies/1')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ technology: "Updated Tech" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});