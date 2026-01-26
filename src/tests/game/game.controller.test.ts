import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as gameService from "@/services/games/game.service";

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
 * HTTP API tests for game controller endpoints.
 */
describe("Game Controller /games", () => {
  let testGameId: number;
  let testTechnologyId: number;
  let testOwnerId: number;
  let testTrackerId: number;
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

      // Create dependencies first
      const technology = await db.Tables.Technology.create({
        technology: "Unity"
      });
      testTechnologyId = technology.technology_id;

      const tracker = await db.Tables.Tracker.create({
        technology_id: technology.technology_id,
        tracker: "TestTracker"
      });
      testTrackerId = tracker.tracker_id;

      const user = await db.Tables.User.create({
        username: "gameowner",
        email: "gameowner@test.com",

        role: "teacher"
      });
      testOwnerId = user.user_id;
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /games returns empty array initially", async () => {
    const response = await request(app).get('/games');
    const data: InstanceType<typeof db.Tables.Game>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /games creates a game", async () => {
    const response = await request(app)
      .post('/games')
      .send({
        name: "Test Game",
        description: "A test game for educational purposes",
        public: true,
        type: "WEB",
        technology_id: testTechnologyId,
        owner_id: testOwnerId,
        tracker_id: testTrackerId
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Game> = response.body;
    expect(data.game_id).toBeDefined();
    expect(data.name).toBe("Test Game");
    expect(data.public).toBe(true);
    expect(data.technology_id).toBe(testTechnologyId);
    expect(data.owner_id).toBe(testOwnerId);
    expect(data.tracker_id).toBe(testTrackerId);
    
    testGameId = data.game_id;
  });

  it("POST /games creates another game", async () => {
    const response = await request(app)
      .post('/games')
      .send({
        name: "Another Game",
        description: "Another test game",
        public: false,
        type: "DESKTOP",
        technology_id: testTechnologyId,
        owner_id: testOwnerId,
        tracker_id: testTrackerId
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.name).toBe("Another Game");
    expect(response.body.public).toBe(false);
  });

  it("GET /games returns all games after creation", async () => {
    const response = await request(app).get('/games');
    const data: InstanceType<typeof db.Tables.Game>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /games/:id returns game by id", async () => {
    const response = await request(app)
      .get(`/games/${testGameId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Game> = response.body;
    expect(data.game_id).toBe(testGameId);
    expect(data.name).toBe("Test Game");
    expect(data.public).toBe(true);
  });

  it("GET /games/:id returns 404 for non-existent game", async () => {
    const response = await request(app)
      .get('/games/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game not found');
  });

  it("PUT /games/:id updates game", async () => {
    const response = await request(app)
      .put(`/games/${testGameId}`)
      .send({
        name: "Updated Test Game",
        public: false
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Game> = response.body;
    expect(data.name).toBe("Updated Test Game");
    expect(data.public).toBe(false);
  });

  it("PUT /games/:gameId/actual-version/:versionId sets version as actual", async () => {
    // First create a game version
    const gameVersion = await db.Tables.GamesVersions.create({
      game_id: testGameId,
      version: "1.0.0",
      external_url: "https://example.com/test-game-v1.0.0"
    });

    // Set this version as actual
    const response = await request(app)
      .put(`/games/${testGameId}/actual-version/${gameVersion.version_id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Game> = response.body;
    expect(data.game_id).toBe(testGameId);
    expect(data.actual).toBe(gameVersion.version_id);
  });

  it("PUT /games/:gameId/actual-version/:versionId returns 404 for non-existent game", async () => {
    const response = await request(app)
      .put('/games/99999/actual-version/1');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game not found');
  });

  it("PUT /games/:gameId/actual-version/:versionId returns 404 for non-existent version", async () => {
    const response = await request(app)
      .put(`/games/${testGameId}/actual-version/99999`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game version not found or does not belong to this game');
  });

  it("DELETE /games/:id deletes game by id", async () => {
    const response = await request(app)
      .delete(`/games/${testGameId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /games/:id returns 404 for non-existent game", async () => {
    const response = await request(app)
      .delete('/games/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game not found');
  });

  it("GET /games handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(gameService, 'getGames').mockRejectedValueOnce(mockError);

    const response = await request(app).get('/games');

    expect(response.status).toBe(500);
    
    // Restore the mock
    jest.restoreAllMocks();
  });

  it("POST /games handles service errors", async () => {
    const mockError = new Error('Validation failed');
    jest.spyOn(gameService, 'createGame').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/games')
      .send({
        name: "Test Game",
        description: "A test game",
        public: true,
        type: "WEB",
        technology_id: testTechnologyId,
        owner_id: testOwnerId,
        tracker_id: testTrackerId
      });

    expect(response.status).toBe(500);
    
    // Restore the mock
    jest.restoreAllMocks();
  });

  it("PUT /games/:id handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(gameService, 'updateGame').mockRejectedValueOnce(mockError);

    // Create a test game first
    const game = await db.Tables.Game.create({
      name: "Test Game for Error",
      description: "A test game",
      public: true,
      type: "WEB",
      technology_id: testTechnologyId,
      owner_id: testOwnerId,
      tracker_id: testTrackerId
    });

    const response = await request(app)
      .put(`/games/${game.game_id}`)
      .send({ name: "Updated Name" });

    expect(response.status).toBe(500);
    
    // Restore the mock
    jest.restoreAllMocks();
  });

  it("PUT /games/:gameId/actual-version/:versionId handles service errors", async () => {
    const mockError = new Error('Service failed');
    jest.spyOn(gameService, 'setGameVersionAsActual').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put('/games/1/actual-version/1');

    expect(response.status).toBe(500);
    
    // Restore the mock
    jest.restoreAllMocks();
  });
});