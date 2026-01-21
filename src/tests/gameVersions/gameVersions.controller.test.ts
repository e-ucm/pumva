import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as gameVersionsService from "@/services/gameVersions.service";

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
 * HTTP API tests for game versions controller endpoints.
 */
describe("GameVersions Controller /game-versions", () => {
  let testGameVersionId: number;
  let testGameId: number;
  let testTechnologyId: number;
  let testOwnerId: number;
  let testTrackerId: number;  let bearerToken: string;
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

      // Create dependencies
      const user = await db.Tables.User.create({
        username: "gameowner",
        email: "owner@test.com",
        role: "teacher"
      });
      testOwnerId = user.user_id;

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
        description: "A test game for game versions",
        public: true,
        type: "WEB",
        technology_id: testTechnologyId,
        owner_id: testOwnerId,
        tracker_id: testTrackerId
      });
      testGameId = game.game_id;
      
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

  it("GET /game-versions returns empty array initially", async () => {
    const response = await request(app).get('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.GamesVersions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /game-versions creates a game version", async () => {
    const response = await request(app)
      .post('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        game_id: testGameId,
        version: "1.0.0",
        external_url: "https://example.com/game-v1.0.0"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamesVersions> = response.body;
    expect(data.version_id).toBeDefined();
    expect(data.game_id).toBe(testGameId);
    expect(data.version).toBe("1.0.0");
    expect(data.external_url).toBe("https://example.com/game-v1.0.0");
    
    testGameVersionId = data.version_id;
  });

  it("POST /game-versions creates another game version", async () => {
    const response = await request(app)
      .post('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        game_id: testGameId,
        version: "1.0.1",
        external_url: "https://example.com/game-v1.0.1"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.version).toBe("1.0.1");
    expect(response.body.external_url).toBe("https://example.com/game-v1.0.1");
  });

  it("GET /game-versions returns all game versions after creation", async () => {
    const response = await request(app).get('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.GamesVersions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /game-versions/:id returns game version by id", async () => {
    const response = await request(app)
      .get(`/game-versions/${testGameVersionId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamesVersions> = response.body;
    expect(data.version_id).toBe(testGameVersionId);
    expect(data.version).toBe("1.0.0");
    expect(data.external_url).toBe("https://example.com/game-v1.0.0");
  });

  it("GET /game-versions/:id returns 404 for non-existent game version", async () => {
    const response = await request(app)
      .get('/game-versions/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game version not found');
  });

  it("PUT /game-versions/:id updates game version", async () => {
    const response = await request(app)
      .put(`/game-versions/${testGameVersionId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        version: "1.0.0-updated",
        external_url: "https://example.com/game-v1.0.0-updated"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamesVersions> = response.body;
    expect(data.version).toBe("1.0.0-updated");
    expect(data.external_url).toBe("https://example.com/game-v1.0.0-updated");
  });

  it("DELETE /game-versions/:id deletes game version by id", async () => {
    const response = await request(app)
      .delete(`/game-versions/${testGameVersionId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /game-versions/:id returns 404 for non-existent game version", async () => {
    const response = await request(app)
      .delete('/game-versions/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game version not found');
  });

  it("GET /game-versions handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(gameVersionsService, 'getGameVersions').mockRejectedValueOnce(mockError);

    const response = await request(app).get('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /game-versions handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(gameVersionsService, 'createGameVersion').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/game-versions')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        game_id: testGameId,
        version: "1.0.0",
        external_url: "https://example.com/test"
      });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /game-versions/:id handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(gameVersionsService, 'updateGameVersionById').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put('/game-versions/1')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ version: "2.0.0" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});