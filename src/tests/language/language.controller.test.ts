import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as languageService from "@/services/language.service";

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
 * HTTP API tests for language controller endpoints.
 */
describe("Language Controller /languages", () => {
  let testLanguageId: number;
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

  it("GET /languages returns empty array initially", async () => {
    const response = await request(app)
      .get('/languages')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.Language>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /languages creates a language", async () => {
    const response = await request(app)
      .post('/languages')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        language: "English"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language_id).toBeDefined();
    expect(data.language).toBe("English");
    
    testLanguageId = data.language_id;
  });

  it("POST /languages creates another language", async () => {
    const response = await request(app)
      .post('/languages')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        language: "Spanish"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.language).toBe("Spanish");
  });

  it("GET /languages returns all languages after creation", async () => {
    const response = await request(app).get('/languages')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.Language>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /languages/:id returns language by id", async () => {
    const response = await request(app)
      .get(`/languages/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language_id).toBe(testLanguageId);
    expect(data.language).toBe("English");
  });

  it("GET /languages/:id returns 404 for non-existent language", async () => {
    const response = await request(app)
      .get('/languages/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Language not found');
  });

  it("PUT /languages/:id updates language", async () => {
    const response = await request(app)
      .put(`/languages/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        language: "English (US)"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language).toBe("English (US)");
  });

  it("DELETE /languages/:id deletes language by id", async () => {
    const response = await request(app)
      .delete(`/languages/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /languages/:id returns 404 for non-existent language", async () => {
    const response = await request(app)
      .delete('/languages/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Language not found');
  });

  it("GET /languages handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(languageService, 'getLanguages').mockRejectedValueOnce(mockError);

    const response = await request(app).get('/languages')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /languages handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(languageService, 'createLanguage').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/languages')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ language: "Test Language" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /languages/:id handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(languageService, 'updateLanguageById').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put('/languages/1')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ language: "Updated Language" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});