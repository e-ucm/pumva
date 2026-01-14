import { db } from "@/lib/db";
import { seedUsers } from "@/lib/seeds/seedFakeData";

describe("Sequelize + SQLite", () => {
  beforeAll(async () => {
      try {
        await db.sequelize.sync({ force: true });
      } catch (err) {
        console.error("Sequelize sync failed:", err);
      }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("should create a user if not present", async () => {
    var user = await db.Tables.User.findOne({ where: { username: "Alice" } });
    if (!user) {
      user = await db.Tables.User.create({
        username: "Alice",
        email: "alice@test.com",
        role: "tester",
      });
    }
    expect(user.user_id).toBeDefined();
    expect(user.username).toBe("Alice");
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
