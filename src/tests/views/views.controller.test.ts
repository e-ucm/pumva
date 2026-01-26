import request from "supertest";
import { app } from "@/app";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

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

describe("Views Controller", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await db.Functions.runSqlFile(config.db.views_sql_file);
  });

  beforeEach(async () => {
    // Setup test data
    const user = await db.Tables.User.create({
      username: "testuser",
      email: "test@example.com",
      role: "TEACHER"
    });

    const technology = await db.Tables.Technology.create({
      technology: "Unity"
    });

    const tracker = await db.Tables.Tracker.create({
      technology_id: technology.technology_id,
      tracker: "Test Tracker"
    });

    const game = await db.Tables.Game.create({
      name: "Test Game",
      public: true,
      description: "A test game",
      type: "WEB",
      owner_id: user.user_id,
      technology_id: technology.technology_id,
      tracker_id: tracker.tracker_id
    });

    await db.Tables.GamePermissions.create({
      game_id: game.game_id,
      user_id: user.user_id,
      permission: "READ"
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db.Tables.GamePermissions.destroy({ where: {} });
    await db.Tables.Game.destroy({ where: {} });
    await db.Tables.Tracker.destroy({ where: {} });
    await db.Tables.Technology.destroy({ where: {} });
    await db.Tables.User.destroy({ where: {} });
  });

  describe("GET /views/games/user/:user_id", () => {
    it("should return games for a valid user", async () => {
      const user = await db.Tables.User.findOne();
      const response = await request(app)
        .get(`/views/games/user/${user!.user_id}`)
        .set("Authorization", `Bearer valid-token`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty("user_id");
        expect(response.body[0]).toHaveProperty("game_id");
        expect(response.body[0]).toHaveProperty("permission");
      }
    });

    it("should return 400 for invalid user_id", async () => {
      await request(app)
        .get("/views/games/user/invalid")
        .set("Authorization", `Bearer valid-token`)
        .expect(400);
    });
  });

  describe("GET /views/games/public", () => {
    it("should return public games", async () => {
      const response = await request(app)
        .get("/views/games/public")
        .set("Authorization", `Bearer valid-token`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /views/guides/user/:user_id/game/:game_id", () => {
    it("should return teacher guides for valid user and game", async () => {
      const user = await db.Tables.User.findOne();
      const game = await db.Tables.Game.findOne();
      
      const response = await request(app)
        .get(`/views/guides/user/${user!.user_id}/game/${game!.game_id}`)
        .set("Authorization", `Bearer valid-token`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 400 for invalid user_id", async () => {
      const game = await db.Tables.Game.findOne();
      
      await request(app)
        .get(`/views/guides/user/invalid/game/${game!.game_id}`)
        .set("Authorization", `Bearer valid-token`)
        .expect(400);
    });

    it("should return 400 for invalid game_id", async () => {
      const user = await db.Tables.User.findOne();
      
      await request(app)
        .get(`/views/guides/user/${user!.user_id}/game/invalid`)
        .set("Authorization", `Bearer valid-token`)
        .expect(400);
    });
  });

  describe("GET /views/users/username/:username", () => {
    it("should return user for valid username", async () => {
      const response = await request(app)
        .get("/views/users/username/testuser")
        .set("Authorization", `Bearer valid-token`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("username", "testuser");
    });

    it("should return 404 for non-existent username", async () => {
      await request(app)
        .get("/views/users/username/nonexistent")
        .set("Authorization", `Bearer valid-token`)
        .expect(404);
    });

    it("should return 400 for empty username", async () => {
      await request(app)
        .get("/views/users/username/")
        .set("Authorization", `Bearer valid-token`)
        .expect(404); // This will be 404 because route won't match
    });
  });
});