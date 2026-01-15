import { createUser, getUserByUsername, getUsers, updateUsers, updateUserById, deleteUserById, deleteUsers } from "@/lib/services/user.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

var user : InstanceType<typeof db.Tables.User> | null;
describe("User service", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
    } catch (err) {
      console.error("Sequelize sync failed:", err);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("creates a user", async () => {
    user = await createUser("Bob", "bob@test.com", "tester");
    expect(user).toBeDefined();
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Bob");
      expect(user.email).toBe("bob@test.com");
      expect(user.role).toBe("tester");
    }
  });

  it("fetches users", async () => {
    const users = await getUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it("update user by Id", async () => {
    user = await updateUserById(user!.user_id, { username: "Tot" });
    expect(user).toBeDefined();
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Tot");
      expect(user.email).toBe("bob@test.com");
      expect(user.role).toBe("tester");
    }
  });

  
  it("update users", async () => {
    const nb = await updateUsers({ role: "tester" }, { email : "tot@test.com"});
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    user = await getUserByUsername("Tot");
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Tot");
      expect(user.email).toBe("tot@test.com");
      expect(user.role).toBe("tester");
    }
  });

    it("delete users", async () => {
      const nb = await deleteUsers({ role: "tester" });
      expect(nb).toBeDefined();
      expect(nb).toBe(1);
      const users = await getUsers();
      expect(users.length).toBeGreaterThanOrEqual(1);
    });

    it("delete user by id", async () => {
      user = await createUser("Charles", "charles@test.com", "tester");
      expect(user).toBeDefined();
      await deleteUserById(user!.user_id);
      user = await getUserByUsername("Charles");
      expect(user).toBeNull();
    });
});