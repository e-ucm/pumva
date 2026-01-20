import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

/**
 * HTTP API tests for game permissions controller endpoints.
 */
describe("GamePermissions Controller /game-permissions", () => {
  let testUserId: number;
  let testGameId: number;
  let testTechnologyId: number;
  let testTrackerId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

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
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /game-permissions returns empty array initially", async () => {
    const response = await request(app).get('/game-permissions');
    const data: InstanceType<typeof db.Tables.GamePermissions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /game-permissions creates a game permission", async () => {
    const response = await request(app)
      .post('/game-permissions')
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
    const response = await request(app).get('/game-permissions');
    const data: InstanceType<typeof db.Tables.GamePermissions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /game-permissions/:userId/:gameId returns game permission by composite key", async () => {
    const response = await request(app)
      .get(`/game-permissions/${testUserId}/${testGameId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamePermissions> = response.body;
    expect(data.user_id).toBe(testUserId);
    expect(data.game_id).toBe(testGameId);
    expect(data.permission).toBe("READ");
  });

  it("GET /game-permissions/:userId/:gameId returns 404 for non-existent game permission", async () => {
    const response = await request(app)
      .get('/game-permissions/99999/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game permission not found');
  });

  it("PUT /game-permissions/:userId/:gameId updates game permission", async () => {
    const response = await request(app)
      .put(`/game-permissions/${testUserId}/${testGameId}`)
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
      .delete(`/game-permissions/${testUserId}/${testGameId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /game-permissions/:userId/:gameId returns 404 for non-existent game permission", async () => {
    const response = await request(app)
      .delete('/game-permissions/99999/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game permission not found');
  });
});