import request from 'supertest';
import axios from 'axios';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as gamePermissionsService from "@/services/gamePermissions.service";

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
 * HTTP API tests for game permissions controller endpoints.
 */
describe("GamePermissions Controller /game-permissions", () => {
  let testUserId: number;
  let testGameId: number;
  let testTechnologyId: number;
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

      // Create dependencies
      const user = await db.Tables.User.create({
        username: "testuser",
        email: "test@test.com",
        role: "student"
      });
      testUserId = user.user_id;

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
        description: "A test game for permissions",
        public: true,
        type: "WEB",
        technology_id: testTechnologyId,
        owner_id: testUserId,
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

  it("GET /game-permissions returns empty array initially", async () => {
    const response = await request(app).get('/game-permissions')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.GamePermissions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /game-permissions creates a game permission", async () => {
    const response = await request(app)
      .post('/game-permissions')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        user_id: testUserId,
        game_id: testGameId,
        permission: "READ"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamePermissions> = response.body;
    expect(data.user_id).toBe(testUserId);
    expect(data.game_id).toBe(testGameId);
    expect(data.permission).toBe("READ");
  });

  it("GET /game-permissions returns all game permissions after creation", async () => {
    const response = await request(app)
      .get('/game-permissions')
      .set('Authorization', `Bearer ${bearerToken}`);
    const data: InstanceType<typeof db.Tables.GamePermissions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /game-permissions/:userId/:gameId returns game permission by composite key", async () => {
    const response = await request(app)
      .get(`/game-permissions/${testUserId}/${testGameId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamePermissions> = response.body;
    expect(data.user_id).toBe(testUserId);
    expect(data.game_id).toBe(testGameId);
    expect(data.permission).toBe("READ");
  });

  it("GET /game-permissions/:userId/:gameId returns 404 for non-existent game permission", async () => {
    const response = await request(app)
      .get('/game-permissions/99999/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game permission not found');
  });

  it("PUT /game-permissions/:userId/:gameId updates game permission", async () => {
    const response = await request(app)
      .put(`/game-permissions/${testUserId}/${testGameId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({
        permission: "WRITE"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamePermissions> = response.body;
    expect(data.permission).toBe("WRITE");
  });

  it("DELETE /game-permissions/:userId/:gameId deletes game permission by composite key", async () => {
    const response = await request(app)
      .delete(`/game-permissions/${testUserId}/${testGameId}`)
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /game-permissions/:userId/:gameId returns 404 for non-existent game permission", async () => {
    const response = await request(app)
      .delete('/game-permissions/99999/99999')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game permission not found');
  });
  it("GET /game-permissions handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(gamePermissionsService, 'getGamePermissions').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .get('/game-permissions')
      .set('Authorization', `Bearer ${bearerToken}`);

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /game-permissions handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(gamePermissionsService, 'createGamePermission').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/game-permissions')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ game_id: testGameId, user_id: testUserId, permissions: "read" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /game-permissions/:userId/:gameId handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(gamePermissionsService, 'updateGamePermissionById').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put(`/game-permissions/${testUserId}/${testGameId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send({ permissions: "write" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });});