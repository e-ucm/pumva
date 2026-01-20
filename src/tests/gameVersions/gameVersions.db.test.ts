import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedUsers, seedTechnologies, seedTrackers, seedGames, seedGameVersions } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for game versions.
 */
describe("GameVersions DB", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let gameVersion: InstanceType<typeof db.Tables.GamesVersions> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

      // Create dependencies
      testUser = await db.Tables.User.create({
        username: "gameowner",
        email: "owner@test.com",
        role: "teacher"
      });

      testTechnology = await db.Tables.Technology.create({
        technology: "Unity"
      });

      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "test_tracker"
      });

      testGame = await db.Tables.Game.create({
        name: "Test Game",
        owner_id: testUser.user_id,
        public: true,
        description: "A test game",
        type: "WEB",
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

  it("should create a game version if not present", async () => {
    gameVersion = await db.Tables.GamesVersions.create({
      game_id: testGame!.game_id,
      version: "1.0.0",
      external_url: "https://example.com/game/v1.0.0"
    });
    expect(gameVersion.version_id).toBeDefined();
    expect(gameVersion.game_id).toBe(testGame!.game_id);
    expect(gameVersion.version).toBe("1.0.0");
    expect(gameVersion.external_url).toBe("https://example.com/game/v1.0.0");
  });

  it("should find all game versions", async () => {
    const versions = await db.Tables.GamesVersions.findAll();
    expect(versions.length).toBeGreaterThanOrEqual(1);
    expect(versions[0].version).toBe("1.0.0");
  });

  it("should find game version by primary key", async () => {
    const foundVersion = await db.Tables.GamesVersions.findByPk(gameVersion!.version_id);
    expect(foundVersion).toBeDefined();
    expect(foundVersion!.version).toBe("1.0.0");
  });

  it("generate 200 game versions into DB", async () => {
    await seedUsers(20);
    await seedTechnologies(5);
    await seedTrackers(5);
    await seedGames(20);
    await seedGameVersions(100);
    const versions = await db.Tables.GamesVersions.findAll();
    expect(versions.length).toBeGreaterThanOrEqual(100);
    expect(versions[0].version_id).toBeDefined();
  });
});
