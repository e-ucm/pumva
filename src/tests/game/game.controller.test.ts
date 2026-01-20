import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

/**
 * HTTP API tests for game controller endpoints.
 */
describe("Game Controller /games", () => {
  let testGameId: number;
  let testTechnologyId: number;
  let testOwnerId: number;
  let testTrackerId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

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
});