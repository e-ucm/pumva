import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedUsers, seedTechnologies, seedTrackers, seedGames, seedUserPermision } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for game permissions.
 */
describe("GamePermissions DB", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let gamePermission: InstanceType<typeof db.Tables.GamePermissions> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      

      // Create dependencies
      testUser = await db.Tables.User.create({
        username: "permuser",
        email: "permuser@test.com",
        role: "student"
      });

      testTechnology = await db.Tables.Technology.create({
        technology: "Godot"
      });

      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "godot_tracker"
      });

      testGame = await db.Tables.Game.create({
        name: "Test Game for Permissions",
        owner_id: testUser.user_id,
        public: false,
        description: "A test game for permissions",
        type: "DESKTOP",
        technology_id: testTechnology.technology_id,
        tracker_id: testTracker.tracker_id,
        external_url: "https://example.com/game"
      });
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a game permission if not present", async () => {
    gamePermission = await db.Tables.GamePermissions.create({
      game_id: testGame!.game_id,
      user_id: testUser!.user_id,
      permission: "READ"
    });
    expect(gamePermission.game_id).toBe(testGame!.game_id);
    expect(gamePermission.user_id).toBe(testUser!.user_id);
    expect(gamePermission.permission).toBe("READ");
  });

  it("should find all game permissions", async () => {
    const permissions = await db.Tables.GamePermissions.findAll();
    expect(permissions.length).toBeGreaterThanOrEqual(1);
    expect(permissions[0].permission).toBe("READ");
  });

  it("should find game permission by composite key", async () => {
    const foundPerm = await db.Tables.GamePermissions.findOne({
      where: {
        game_id: testGame!.game_id,
        user_id: testUser!.user_id
      }
    });
    expect(foundPerm).toBeDefined();
    expect(foundPerm!.permission).toBe("READ");
  });

  it("generate 200 game permissions into DB", async () => {
    await seedUsers(30);
    await seedTechnologies(5);
    await seedTrackers(2);
    await seedGames(20,"student");
    await seedUserPermision(200);
    const permissions = await db.Tables.GamePermissions.findAll();
    expect(permissions.length).toBeGreaterThan(0);
  });
});
