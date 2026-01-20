import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { 
  clearDatabase,
  seedUsers, 
  seedGames,
  seedGameVersions,
  seedTeachersGuides,
  seedUserPermision,
  seedTechnologies,
  seedTrackers,
  seedLanguages,
  seedFakeData
} from "@/lib/seeds/seedFakeData";

/**
 * Tests for seedFakeData functions to achieve 100% coverage.
 * Focuses on error conditions and warning paths.
 */
describe("SeedFakeData Coverage Tests", () => {
  beforeEach(async () => {
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

  describe("seedGames error conditions", () => {
    it("should throw error when no users with specified role exist", async () => {
      await expect(seedGames(10, "teacher")).rejects.toThrow(
        "No teacher users found. Please seed users first."
      );
    });

    it("should log warning when unable to generate enough unique game names", async () => {
      const warnSpy = jest.spyOn(logger, "warn");
      
      // Create minimal setup
      await db.Tables.User.create({
        username: "testuser",
        email: "test@test.com",
        role: "teacher"
      });
      await seedTechnologies(1);
      await seedTrackers(1);

      // Mock faker to return same name repeatedly and string to return same suffix
      const originalProductName = require("@faker-js/faker").faker.commerce.productName;
      const originalDataString = require("@faker-js/faker").faker.datatype.string;
      const mockProductName = jest.fn().mockReturnValue("Same Game Name");
      const mockDataString = jest.fn().mockReturnValue("AAAAAA");
      require("@faker-js/faker").faker.commerce.productName = mockProductName;
      require("@faker-js/faker").faker.datatype.string = mockDataString;

      await seedGames(50, "teacher");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Only generated")
      );

      // Restore originals
      require("@faker-js/faker").faker.commerce.productName = originalProductName;
      require("@faker-js/faker").faker.datatype.string = originalDataString;
      warnSpy.mockRestore();
    });
  });

  describe("seedGameVersions error and warning conditions", () => {
    it("should throw error when no games exist", async () => {
      await expect(seedGameVersions(10)).rejects.toThrow(
        "No games found. Please seed games first."
      );
    });

    it("should log warning when unable to generate enough unique game version combinations", async () => {
      const warnSpy = jest.spyOn(logger, "warn");
      
      // Create minimal setup - only 1 game
      await db.Tables.User.create({
        username: "adminuser1",
        email: "admin1@test.com",
        role: "admin"
      });
      await seedTechnologies(1);
      await seedTrackers(1);
      await seedGames(1, "admin");

      // Mock semver to return same version repeatedly
      const originalSemver = require("@faker-js/faker").faker.system.semver;
      const mockSemver = jest.fn().mockReturnValue("1.0.0");
      require("@faker-js/faker").faker.system.semver = mockSemver;

      await seedGameVersions(50);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Only generated")
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("limited by available game-version combinations")
      );

      // Restore original
      require("@faker-js/faker").faker.system.semver = originalSemver;
      warnSpy.mockRestore();
    });
  });

  describe("seedTeachersGuides error and warning conditions", () => {
    it("should throw error when no games exist", async () => {
      await expect(seedTeachersGuides(10)).rejects.toThrow(
        "No games found. Please seed games first."
      );
    });

    it("should throw error when no languages exist", async () => {
      // Create games but no languages
      await db.Tables.User.create({
        username: "adminuser2",
        email: "admin2@test.com",
        role: "admin"
      });
      await seedTechnologies(1);
      await seedTrackers(1);
      await seedGames(1, "admin");

      await expect(seedTeachersGuides(10)).rejects.toThrow(
        "No languages found. Please seed languages first."
      );
    });

    it("should log warning when unable to generate enough unique game-language combinations", async () => {
      const warnSpy = jest.spyOn(logger, "warn");
      
      // Create minimal setup - 2 games and 2 languages = max 4 combinations
      await db.Tables.User.create({
        username: "adminuser3",
        email: "admin3@test.com",
        role: "admin"
      });
      await seedTechnologies(1);
      await seedTrackers(1);
      await seedGames(2, "admin");
      
      await db.Tables.Language.create({ language: "English" });
      await db.Tables.Language.create({ language: "Spanish" });

      // Request more than possible unique combinations
      await seedTeachersGuides(50);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Only generated")
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("limited by available game-language combinations")
      );

      warnSpy.mockRestore();
    });
  });

  describe("seedUserPermision error and warning conditions", () => {
    it("should throw error when no games exist", async () => {
      await expect(seedUserPermision(10)).rejects.toThrow(
        "No games found. Please seed games first."
      );
    });

    it("should throw error when no users exist", async () => {
      // Create games but no users
      await db.Tables.User.create({
        username: "tempuser",
        email: "temp@test.com",
        role: "admin"
      });
      await seedTechnologies(1);
      await seedTrackers(1);
      await seedGames(1, "admin");
      
      // Delete only users, not games
      await db.Tables.User.destroy({ where: {} });

      await expect(seedUserPermision(10)).rejects.toThrow(
        "No users found. Please seed users first."
      );
    });

    it("should log warning when unable to generate enough unique game-user combinations", async () => {
      const warnSpy = jest.spyOn(logger, "warn");
      
      // Create minimal setup - 2 games and 2 users = max 4 combinations
      await db.Tables.User.create({
        username: "user1",
        email: "user1@test.com",
        role: "student"
      });
      await db.Tables.User.create({
        username: "user2",
        email: "user2@test.com",
        role: "student"
      });
      await db.Tables.User.create({
        username: "adminuser4",
        email: "admin4@test.com",
        role: "admin"
      });
      await seedTechnologies(1);
      await seedTrackers(1);
      await seedGames(2, "admin");

      // Request more than possible unique combinations
      await seedUserPermision(50);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Only generated")
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("limited by available game-user combinations")
      );

      warnSpy.mockRestore();
    });
  });

  describe("seedUsers warning condition", () => {
    it("should log warning when unable to generate enough unique users", async () => {
      const warnSpy = jest.spyOn(logger, "warn");
      
      // Mock faker to return same username/email repeatedly
      const originalUserName = require("@faker-js/faker").faker.internet.userName;
      const originalEmail = require("@faker-js/faker").faker.internet.email;
      const mockUserName = jest.fn().mockReturnValue("sameuser");
      const mockEmail = jest.fn().mockReturnValue("same@email.com");
      require("@faker-js/faker").faker.internet.userName = mockUserName;
      require("@faker-js/faker").faker.internet.email = mockEmail;

      await seedUsers(50);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Only generated")
      );

      // Restore originals
      require("@faker-js/faker").faker.internet.userName = originalUserName;
      require("@faker-js/faker").faker.internet.email = originalEmail;
      warnSpy.mockRestore();
    });
  });

  describe("clearDatabase", () => {
    it("should clear all tables in the database", async () => {
      // Create some data first
      await db.Tables.User.create({
        username: "cleartest",
        email: "clear@test.com",
        role: "student"
      });
      await seedTechnologies(1);

      // Verify data exists
      let users = await db.Tables.User.findAll();
      let technologies = await db.Tables.Technology.findAll();
      expect(users.length).toBeGreaterThan(0);
      expect(technologies.length).toBeGreaterThan(0);

      // Clear database
      await clearDatabase();

      // Verify all data is gone
      users = await db.Tables.User.findAll();
      technologies = await db.Tables.Technology.findAll();
      const games = await db.Tables.Game.findAll();
      const languages = await db.Tables.Language.findAll();
      
      expect(users.length).toBe(0);
      expect(technologies.length).toBe(0);
      expect(games.length).toBe(0);
      expect(languages.length).toBe(0);
    });
  });

  describe("seedLanguages with suffixes", () => {
    it("should generate languages with regional suffixes when count > 12", async () => {
      // Request more than base languages to trigger suffix logic
      await seedLanguages(25);
      
      const languages = await db.Tables.Language.findAll();
      expect(languages.length).toBe(25);
      
      // Check that some languages have suffixes
      const languagesWithSuffixes = languages.filter(l => 
        l.language.includes("(") && l.language.includes(")")
      );
      expect(languagesWithSuffixes.length).toBeGreaterThan(0);
    });
  });

  describe("seedFakeData main function", () => {
    it("should seed all tables with default data", async () => {
      await seedFakeData();

      // Verify all tables have data
      const users = await db.Tables.User.findAll();
      const technologies = await db.Tables.Technology.findAll();
      const trackers = await db.Tables.Tracker.findAll();
      const games = await db.Tables.Game.findAll();
      const gameVersions = await db.Tables.GamesVersions.findAll();
      const languages = await db.Tables.Language.findAll();
      const teacherGuides = await db.Tables.TeacherGuide.findAll();
      const permissions = await db.Tables.GamePermissions.findAll();

      expect(users.length).toBeGreaterThanOrEqual(20);
      expect(technologies.length).toBeGreaterThan(0);
      expect(trackers.length).toBeGreaterThan(0);
      expect(games.length).toBeGreaterThan(0);
      expect(gameVersions.length).toBeGreaterThanOrEqual(200);
      expect(languages.length).toBeGreaterThanOrEqual(10);
      expect(teacherGuides.length).toBeGreaterThanOrEqual(50);
      expect(permissions.length).toBeGreaterThanOrEqual(200);
    });
  });
});
