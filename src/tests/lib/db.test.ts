import { db } from "@/lib/db";
import { config } from "@/lib/config";

/**
 * Tests for database initialization and logging.
 */
describe("Database", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await db.Functions.runSqlFile(config.db.views_sql_file);
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should execute queries with logging", async () => {
    // This will trigger the logging function in the Sequelize config
    await db.sequelize.query("SELECT 1 as test");
    
    // Verify db is properly initialized
    expect(db.sequelize).toBeDefined();
    expect(db.Tables).toBeDefined();
    expect(db.Functions).toBeDefined();
    expect(db.Views).toBeDefined();
  });

  it("should have all required tables", () => {
    expect(db.Tables.User).toBeDefined();
    expect(db.Tables.Game).toBeDefined();
    expect(db.Tables.Technology).toBeDefined();
    expect(db.Tables.Tracker).toBeDefined();
    expect(db.Tables.GamesVersions).toBeDefined();
    expect(db.Tables.Language).toBeDefined();
    expect(db.Tables.TeacherGuide).toBeDefined();
    expect(db.Tables.GamePermissions).toBeDefined();
  });
});