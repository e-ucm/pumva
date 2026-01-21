import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as teacherGuideService from "@/services/teacherGuide.service";

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
 * HTTP API tests for teacher guide controller endpoints.
 */
describe("TeacherGuide Controller /teacher-guides", () => {
  let testGameId: number;
  let testLanguageId: number;
  let testTechnologyId: number;
  let testOwnerId: number;
  let testTrackerId: number;
  let bearerToken: string;

  beforeAll(async () => {
    try {
      // Fix config paths for test environment
      //const originalAppFolder = config.appFolder;
      //config.appFolder = process.cwd();
      //config.db.sql_files_path = config.appFolder + "/" + config.db.sql_files_subpath;
      //config.db.views_sql_file = config.db.sql_files_path + "/" + config.db.views_sql_filename;
      
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

      // Create dependencies
      const user = await db.Tables.User.create({
        username: "gameowner",
        email: "owner@test.com",
        role: "teacher"
      });
      testOwnerId = user.user_id;

      const language = await db.Tables.Language.create({
        language: "English"
      });
      testLanguageId = language.language_id;

      const technology = await db.Tables.Technology.create({
        technology: "Unity"
      });
      testTechnologyId = technology.technology_id;

      const tracker = await db.Tables.Tracker.create({
        technology_id: testTechnologyId,
        tracker: "TestTracker"
      });
      testTrackerId = tracker.tracker_id;

      const game = await db.Tables.Game.create({
        name: "Test Game",
        description: "A test game for teacher guides",
        public: true,
        type: "WEB",
        technology_id: testTechnologyId,
        owner_id: testOwnerId,
        tracker_id: testTrackerId
      });
      testGameId = game.game_id;
      
      // Get Keycloak authentication token
      bearerToken = await getKeycloakToken();
      logger.info(`Obtained Keycloak bearer token for tests`);
      
      // Restore original config after setup
      //config.appFolder = originalAppFolder;
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /teacher-guides returns empty array initially", async () => {
    const response = await request(app)
      .get('/teacher-guides')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.TeacherGuide>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /teacher-guides creates a teacher guide", async () => {
    const response = await request(app)
      .post('/teacher-guides')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        game_id: testGameId,
        language_id: testLanguageId,
        url: "https://example.com/guides/comprehensive-teacher-guide"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.TeacherGuide> = response.body;
    expect(data.game_id).toBe(testGameId);
    expect(data.language_id).toBe(testLanguageId);
    expect(data.url).toBe("https://example.com/guides/comprehensive-teacher-guide");
  });

  it("GET /teacher-guides returns all teacher guides after creation", async () => {
    const response = await request(app)
      .get('/teacher-guides')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.TeacherGuide>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /teacher-guides/:gameId/:languageId returns teacher guide by composite key", async () => {
    const response = await request(app)
      .get(`/teacher-guides/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.TeacherGuide> = response.body;
    expect(data.game_id).toBe(testGameId);
    expect(data.language_id).toBe(testLanguageId);
    expect(data.url).toBe("https://example.com/guides/comprehensive-teacher-guide");
  });

  it("GET /teacher-guides/:gameId/:languageId returns 404 for non-existent teacher guide", async () => {
    const response = await request(app)
      .get('/teacher-guides/99999/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher guide not found');
  });

  it("PUT /teacher-guides/:gameId/:languageId updates teacher guide", async () => {
    const response = await request(app)
      .put(`/teacher-guides/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        url: "https://example.com/guides/updated-teacher-guide"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.TeacherGuide> = response.body;
    expect(data.url).toBe("https://example.com/guides/updated-teacher-guide");
  });

  it("GET /teacher-guides/complete-permissions-view returns complete permissions", async () => {
    const response = await request(app)
      .get(`/teacher-guides/complete-permissions-view/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("DELETE /teacher-guides/:gameId/:languageId deletes teacher guide by composite key", async () => {
    const response = await request(app)
      .delete(`/teacher-guides/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /teacher-guides/:gameId/:languageId returns 404 for non-existent teacher guide", async () => {
    const response = await request(app)
      .delete('/teacher-guides/99999/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher guide not found');
  });
  it("GET /teacher-guides handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(teacherGuideService, 'getTeacherGuides').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get('/teacher-guides')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /teacher-guides handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(teacherGuideService, 'createTeacherGuide').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/teacher-guides')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ game_id: testGameId, language_id: testLanguageId, url: "https://example.com/guide" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /teacher-guides/:gameId/:languageId handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(teacherGuideService, 'updateTeacherGuideById').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put(`/teacher-guides/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ url: "https://updated.com/guide" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("GET /teacher-guides/complete-permissions-view/:gameId/:languageId handles service errors", async () => {
    const mockError = new Error('Service failed');
    jest.spyOn(teacherGuideService, 'getTeacherGuidesByUserAndGame').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get(`/teacher-guides/complete-permissions-view/${testGameId}/${testLanguageId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });});