import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedUsers } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for users.
 */
var user : InstanceType<typeof db.Tables.User> | null;
describe("Sequelize + SQLite", () => {
  beforeAll(async () => {
      try {
        await db.sequelize.sync({ force: true });
        await db.Functions.runSqlFile(config.db.views_sql_file);
      } catch (err) {
        logger.error({ err }, "Sequelize sync failed");
      }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a user if not present", async () => {
    user = await db.Tables.User.create({
      username: "Alice",
      email: "alice@test.com",
      role: "tester",
    });
    expect(user.user_id).toBeDefined();
    expect(user.username).toBe("Alice");
    expect(user.email).toBe("alice@test.com");
    expect(user.role).toBe("tester");
  });

  it("should find all users", async () => {
    const users = await db.Tables.User.findAll();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].username).toBe("Alice");
  });

  it("should query user by username using view", async () => {
      const results = await db.Functions.runViewQuery(
        db.Views.Users.byUsername,
        { username: "Alice" }
      );
      expect(results.length).toBe(1);
      expect((results[0] as any).username).toBe("Alice");
  });

  it("generate 10 users into DB", async () => {
    await seedUsers(10);
    const users = await db.Tables.User.findAll();
    expect(users.length).toBeGreaterThanOrEqual(10);
    expect(users[0].user_id).toBeDefined();
  });
});
