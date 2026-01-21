process.env.NODE_ENV = "development";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

/**
 * Tests for database initialization and logging.
 */
describe("Database", () => {
  beforeAll(async () => {
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should execute queries with logging", async () => {
    // Mock logger.debug to verify SQL logging is called
    const loggerDebugSpy = jest.spyOn(require('@/lib/logger').logger, 'debug');
    
    // This will trigger the logging function in the Sequelize config
    await db.sequelize.query("SELECT 1 as test");
    
    // Verify that the SQL logging function was called
    expect(loggerDebugSpy).toHaveBeenCalledWith(expect.stringContaining("SELECT 1 as test"));
    
    // Verify db is properly initialized
    expect(db.sequelize).toBeDefined();
    expect(db.Tables).toBeDefined();
    expect(db.Functions).toBeDefined();
    expect(db.Views).toBeDefined();
    
    // Restore spy
    loggerDebugSpy.mockRestore();
  });

  it("should log SQL queries through sequelize logging function", async () => {
    const loggerDebugSpy = jest.spyOn(require('@/lib/logger').logger, 'debug');
    
    // Execute multiple different SQL operations to trigger logging
    await db.sequelize.query("SELECT COUNT(*) as count FROM sqlite_master");
    await db.sequelize.query("PRAGMA table_info(sqlite_master)");
    
    // Verify the logging function (line 49) was called for each query
    expect(loggerDebugSpy).toHaveBeenCalledWith(expect.stringContaining("SELECT COUNT(*)"));
    expect(loggerDebugSpy).toHaveBeenCalledWith(expect.stringContaining("PRAGMA table_info"));
    
    loggerDebugSpy.mockRestore();
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