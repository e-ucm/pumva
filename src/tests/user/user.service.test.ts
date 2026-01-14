import { createUser, getUserByUsername, getUsers } from "@/lib/services/user.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

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
    var user = await getUserByUsername("Bob");
    if(!user) {
        user = await createUser("Bob", "bob@test.com", "tester");
    }
    expect(user).toBeDefined();
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Bob");
    }
  });

  it("fetches users", async () => {
    const users = await getUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });
});
