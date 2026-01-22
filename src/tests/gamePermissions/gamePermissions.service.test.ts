import { 
  createGamePermission, 
  getGamePermissions, 
  getGamePermissionById, 
  updateGamePermissions, 
  updateGamePermissionById, 
  deleteGamePermissions, 
  deleteGamePermissionById 
} from "@/services/gamePermissions.service";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { config } from "@/lib/config";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Integration tests for gamePermissions service CRUD operations and error handling.
 */
describe("GamePermissions service", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testUser2: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let gamePermission: InstanceType<typeof db.Tables.GamePermissions> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      
      
      // Create test user
      testUser = await db.Tables.User.create({
        username: "testuser_permissions",
        email: "testperm@example.com",
        role: "student"
      });

      // Create second test user
      testUser2 = await db.Tables.User.create({
        username: "testuser_permissions2",
        email: "testperm2@example.com",
        role: "teacher"
      });

      // Create test technology
      testTechnology = await db.Tables.Technology.create({
        technology: "Unity"
      });

      // Create test tracker
      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "test_tracker"
      });

      // Create test game
      testGame = await db.Tables.Game.create({
        name: "Test Game Permissions",
        owner_id: testUser.user_id,
        public: false,
        description: "A test game for permissions",
        type: "WEB",
        technology_id: testTechnology.technology_id,
        tracker_id: testTracker.tracker_id,
        external_url: "https://example.com/game"
      });
    } catch (err) {
      logger.error({ err }, "Setup failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a game permission", async () => {
    gamePermission = await createGamePermission({
      game_id: testGame!.game_id,
      user_id: testUser!.user_id,
      permission: "READ"
    });
    expect(gamePermission).toBeDefined();
    expect(gamePermission.game_id).toBe(testGame!.game_id);
    expect(gamePermission.user_id).toBe(testUser!.user_id);
    expect(gamePermission.permission).toBe("READ");
  });

  it("fetches game permissions", async () => {
    const permissions = await getGamePermissions();
    expect(permissions.length).toBeGreaterThanOrEqual(1);
  });

  it("gets game permission by composite id", async () => {
    const permission = await getGamePermissionById(
      testGame!.game_id,
      testUser!.user_id
    );
    expect(permission).toBeDefined();
    expect(permission!.permission).toBe("READ");
  });

  it("update game permission by composite id", async () => {
    gamePermission = await updateGamePermissionById(
      testGame!.game_id,
      testUser!.user_id,
      { permission: "WRITE" }
    );
    expect(gamePermission).toBeDefined();
    expect(gamePermission.permission).toBe("WRITE");
  });

  it("update game permission by id should throw when permission not found", async () => {
    expect.assertions(1);
    await expect(
      updateGamePermissionById(9999, 9999, { permission: "ADMIN" })
    ).rejects.toThrow(NotFoundError);
  });

  it("update game permissions", async () => {
    const nb = await updateGamePermissions(
      { game_id: testGame!.game_id, user_id: testUser!.user_id },
      { permission: "ADMIN" }
    );
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    
    gamePermission = await getGamePermissionById(
      testGame!.game_id,
      testUser!.user_id
    );
    expect(gamePermission!.permission).toBe("ADMIN");
  });

  it("creates multiple game permissions for different users", async () => {
    const permission2 = await createGamePermission({
      game_id: testGame!.game_id,
      user_id: testUser2!.user_id,
      permission: "READ"
    });
    expect(permission2).toBeDefined();
    expect(permission2.user_id).toBe(testUser2!.user_id);
    
    const permissions = await getGamePermissions();
    expect(permissions.length).toBeGreaterThanOrEqual(2);
  });

  it("delete game permissions by condition", async () => {
    const nb = await deleteGamePermissions({ 
      game_id: testGame!.game_id,
      user_id: testUser2!.user_id 
    });
    expect(nb).toBe(1);
    
    await expect(getGamePermissionById(
      testGame!.game_id,
      testUser2!.user_id
    )).rejects.toThrow(NotFoundError);
  });

  it("delete game permission by composite id", async () => {
    await deleteGamePermissionById(
      testGame!.game_id,
      testUser!.user_id
    );
    
    await expect(getGamePermissionById(
      testGame!.game_id,
      testUser!.user_id
    )).rejects.toThrow(NotFoundError);
  });

  it("delete game permission by id should throw when permission not found", async () => {
    expect.assertions(1);
    await expect(
      deleteGamePermissionById(999999, 999999)
    ).rejects.toThrow(NotFoundError);
  });
});
