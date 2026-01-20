import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

/**
 * HTTP API tests for game versions controller endpoints.
 */
describe("GameVersions Controller /game-versions", () => {
  let testGameVersionId: number;
  let testGameId: number;
  let testTechnologyId: number;
  let testOwnerId: number;
  let testTrackerId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

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
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /game-versions returns empty array initially", async () => {
    const response = await request(app).get('/game-versions');
    const data: InstanceType<typeof db.Tables.GamesVersions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /game-versions creates a game version", async () => {
    const response = await request(app)
      .post('/game-versions')
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
    const response = await request(app).get('/game-versions');
    const data: InstanceType<typeof db.Tables.GamesVersions>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /game-versions/:id returns game version by id", async () => {
    const response = await request(app)
      .get(`/game-versions/${testGameVersionId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.GamesVersions> = response.body;
    expect(data.version_id).toBe(testGameVersionId);
    expect(data.version).toBe("1.0.0");
    expect(data.external_url).toBe("https://example.com/game-v1.0.0");
  });

  it("GET /game-versions/:id returns 404 for non-existent game version", async () => {
    const response = await request(app)
      .get('/game-versions/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game version not found');
  });

  it("PUT /game-versions/:id updates game version", async () => {
    const response = await request(app)
      .put(`/game-versions/${testGameVersionId}`)
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
      .delete(`/game-versions/${testGameVersionId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /game-versions/:id returns 404 for non-existent game version", async () => {
    const response = await request(app)
      .delete('/game-versions/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Game version not found');
  });
});