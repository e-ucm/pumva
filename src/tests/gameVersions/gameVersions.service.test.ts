import { 
  createGameVersion, 
  getGameVersions, 
  getGameVersionById, 
  updateGameVersions, 
  updateGameVersionById, 
  deleteGameVersions, 
  deleteGameVersionById 
} from "@/services/gameVersions.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Integration tests for gameVersions service CRUD operations and error handling.
 */
describe("GameVersions service", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let gameVersion: InstanceType<typeof db.Tables.GamesVersions> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
      
      // Create test user
      testUser = await db.Tables.User.create({
        username: "testuser_versions",
        email: "testversions@example.com",
        role: "teacher"
      });

      // Create test technology
      testTechnology = await db.Tables.Technology.create({
        technology: "Unreal Engine"
      });

      // Create test tracker
      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "unreal_tracker"
      });

      // Create test game
      testGame = await db.Tables.Game.create({
        name: "Test Game Versions",
        owner_id: testUser.user_id,
        public: true,
        description: "A test game for versions",
        type: "WEB",
        technology_id: testTechnology.technology_id,
        tracker_id: testTracker.tracker_id,
        external_url: "https://example.com/game-versions"
      });
    } catch (err) {
      console.error("Setup failed:", err);
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a game version", async () => {
    gameVersion = await createGameVersion({
      game_id: testGame!.game_id,
      version: "1.0.0",
      external_url: "https://example.com/game-v1.0.0"
    });
    expect(gameVersion).toBeDefined();
    expect(gameVersion.version_id).toBeDefined();
    expect(gameVersion.game_id).toBe(testGame!.game_id);
    expect(gameVersion.version).toBe("1.0.0");
    expect(gameVersion.external_url).toBe("https://example.com/game-v1.0.0");
  });

  it("fetches game versions", async () => {
    const versions = await getGameVersions();
    expect(versions.length).toBeGreaterThanOrEqual(1);
  });

  it("gets game version by id", async () => {
    const version = await getGameVersionById(gameVersion!.version_id);
    expect(version).toBeDefined();
    expect(version!.version).toBe("1.0.0");
  });

  it("update game version by id", async () => {
    gameVersion = await updateGameVersionById(
      gameVersion!.version_id,
      { version: "1.0.1", external_url: "https://example.com/game-v1.0.1" }
    );
    expect(gameVersion).toBeDefined();
    expect(gameVersion.version).toBe("1.0.1");
    expect(gameVersion.external_url).toBe("https://example.com/game-v1.0.1");
  });

  it("update game version by id should throw when version not found", async () => {
    expect.assertions(1);
    await expect(
      updateGameVersionById(9999, { version: "2.0.0" })
    ).rejects.toThrow(NotFoundError);
  });

  it("update game versions", async () => {
    const nb = await updateGameVersions(
      { version_id: gameVersion!.version_id },
      { version: "1.1.0" }
    );
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    
    gameVersion = await getGameVersionById(gameVersion!.version_id);
    expect(gameVersion!.version).toBe("1.1.0");
  });

  it("creates multiple game versions", async () => {
    const version2 = await createGameVersion({
      game_id: testGame!.game_id,
      version: "2.0.0",
      external_url: "https://example.com/game-v2.0.0"
    });
    expect(version2).toBeDefined();
    expect(version2.version).toBe("2.0.0");
    
    const versions = await getGameVersions();
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });

  it("delete game versions by condition", async () => {
    const nb = await deleteGameVersions({ version: "2.0.0" });
    expect(nb).toBeGreaterThanOrEqual(1);
    
    const versions = await getGameVersions();
    const hasVersion2 = versions.some(v => v.version === "2.0.0");
    expect(hasVersion2).toBe(false);
  });

  it("delete game version by id", async () => {
    const tempVersion = await createGameVersion({
      game_id: testGame!.game_id,
      version: "3.0.0",
      external_url: "https://example.com/game-v3.0.0"
    });
    
    await deleteGameVersionById(tempVersion.version_id);
    
    const deletedVersion = await getGameVersionById(tempVersion.version_id);
    expect(deletedVersion).toBeNull();
  });

  it("delete game version by id should throw when version not found", async () => {
    expect.assertions(1);
    await expect(
      deleteGameVersionById(9999)
    ).rejects.toThrow(NotFoundError);
  });
});
