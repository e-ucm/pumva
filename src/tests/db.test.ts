const { db } = require("@/lib/db");
const { logger } = require("@/lib/logger");
logger.info("Running DB tests...");
logger.info(db.Tables.Users);
logger.info(db.Views);

describe("Sequelize + SQLite", () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV == "test") {
      await db.sequelize.sync({ force: true }); // start with empty DB
    } else {
      await db.sequelize.authenticate();
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("should create a user if not present", async () => {
    var user = await db.Tables.Users.findOne({ where: { username: "Alice" } });
    if (!user) {
      user = await db.Tables.Users.create({
        username: "Alice",
        email: "alice@test.com",
        role: "tester",
      });
    }
    expect(user.user_id).toBeDefined();
    expect(user.username).toBe("Alice");
  });

  it("should find all users", async () => {
    const users = await db.Tables.Users.findAll();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].username).toBe("Alice");
  });

  it("should query user by username using view", async () => {
    const results = await db.Functions.runViewQuery(
      db.Views.Users.byUsername,
      { username: "Alice" }
    );
    expect(results.length).toBe(1);
    expect(results[0].username).toBe("Alice");
  });
});
