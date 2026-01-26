import {
  createTeacherGuide,
  getTeacherGuides,
  getTeacherGuideById,
  updateTeacherGuides,
  updateTeacherGuideById,
  deleteTeacherGuides,
  deleteTeacherGuideById
} from "@/services/teacherGuide/teacherGuide.service";
import { getTeacherGuidesByUserAndGame } from "@/services/views/views.service";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { config } from "@/lib/config";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Integration tests for teacherGuide service CRUD operations and error handling.
 */
describe("TeacherGuide service", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let testLanguage: InstanceType<typeof db.Tables.Language> | null;
  let testLanguage2: InstanceType<typeof db.Tables.Language> | null;
  let teacherGuide: InstanceType<typeof db.Tables.TeacherGuide> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
      
      // Create test user
      testUser = await db.Tables.User.create({
        username: "testuser_guides",
        email: "testguides@example.com",
        role: "teacher"
      });

      // Create test technology
      testTechnology = await db.Tables.Technology.create({
        technology: "Phaser"
      });

      // Create test tracker
      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "phaser_tracker"
      });

      // Create test game
      testGame = await db.Tables.Game.create({
        name: "Test Game Guides",
        owner_id: testUser.user_id,
        public: true,
        description: "A test game for teacher guides",
        type: "WEB",
        technology_id: testTechnology.technology_id,
        tracker_id: testTracker.tracker_id,
        external_url: "https://example.com/game-guides"
      });

      // Create test languages
      testLanguage = await db.Tables.Language.create({
        language: "English"
      });

      testLanguage2 = await db.Tables.Language.create({
        language: "Spanish"
      });

      // Create game permission for the view query
      await db.Tables.GamePermissions.create({
        game_id: testGame.game_id,
        user_id: testUser.user_id,
        permission: "READ"
      });
    } catch (err) {
      logger.error({ err }, "Setup failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a teacher guide", async () => {
    teacherGuide = await createTeacherGuide({
      game_id: testGame!.game_id,
      language_id: testLanguage!.language_id,
      url: "https://example.com/guides/game1-en"
    });
    expect(teacherGuide).toBeDefined();
    expect(teacherGuide.game_id).toBe(testGame!.game_id);
    expect(teacherGuide.language_id).toBe(testLanguage!.language_id);
    expect(teacherGuide.url).toBe("https://example.com/guides/game1-en");
  });

  it("fetches teacher guides", async () => {
    const guides = await getTeacherGuides();
    expect(guides.length).toBeGreaterThanOrEqual(1);
  });

  it("gets teacher guide by composite id", async () => {
    const guide = await getTeacherGuideById(
      testGame!.game_id,
      testLanguage!.language_id
    );
    expect(guide).toBeDefined();
    expect(guide!.url).toBe("https://example.com/guides/game1-en");
  });

  it("update teacher guide by composite id", async () => {
    teacherGuide = await updateTeacherGuideById(
      testGame!.game_id,
      testLanguage!.language_id,
      { url: "https://example.com/guides/game1-en-v2" }
    );
    expect(teacherGuide).toBeDefined();
    expect(teacherGuide.url).toBe("https://example.com/guides/game1-en-v2");
  });

  it("update teacher guide by id should throw when guide not found", async () => {
    expect.assertions(1);
    await expect(
      updateTeacherGuideById(9999, 9999, { url: "https://example.com/notfound" })
    ).rejects.toThrow(NotFoundError);
  });

  it("update teacher guides", async () => {
    const nb = await updateTeacherGuides(
      { game_id: testGame!.game_id, language_id: testLanguage!.language_id },
      { url: "https://example.com/guides/game1-en-v3" }
    );
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    
    teacherGuide = await getTeacherGuideById(
      testGame!.game_id,
      testLanguage!.language_id
    );
    expect(teacherGuide!.url).toBe("https://example.com/guides/game1-en-v3");
  });

  it("creates multiple teacher guides for different languages", async () => {
    const guide2 = await createTeacherGuide({
      game_id: testGame!.game_id,
      language_id: testLanguage2!.language_id,
      url: "https://example.com/guides/game1-es"
    });
    expect(guide2).toBeDefined();
    expect(guide2.language_id).toBe(testLanguage2!.language_id);
    
    const guides = await getTeacherGuides();
    expect(guides.length).toBeGreaterThanOrEqual(2);
  });

  it("gets teacher guides by user and game using view query", async () => {
    const guides = await getTeacherGuidesByUserAndGame(
      testUser!.user_id,
      testGame!.game_id
    );
    expect(guides).toBeDefined();
    expect(guides.length).toBeGreaterThanOrEqual(1);
    expect(guides[0].user_id).toBe(testUser!.user_id);
    expect(guides[0].game_id).toBe(testGame!.game_id);
    expect(guides[0].username).toBe("testuser_guides");
    expect(guides[0].language).toBeDefined();
    expect(guides[0].permission).toBe("OWNER");
  });

  it("delete teacher guides by condition", async () => {
    const nb = await deleteTeacherGuides({ 
      game_id: testGame!.game_id,
      language_id: testLanguage2!.language_id 
    });
    expect(nb).toBe(1);
    
    await expect(getTeacherGuideById(
      testGame!.game_id,
      testLanguage2!.language_id
    )).rejects.toThrow(NotFoundError);
  });

  it("delete teacher guide by composite id", async () => {
    await deleteTeacherGuideById(
      testGame!.game_id,
      testLanguage!.language_id
    );
    
    await expect(getTeacherGuideById(
      testGame!.game_id,
      testLanguage!.language_id
    )).rejects.toThrow(NotFoundError);
  });

  it("delete teacher guide by id should throw when guide not found", async () => {
    expect.assertions(1);
    await expect(
      deleteTeacherGuideById(testGame!.game_id, testLanguage!.language_id)
    ).rejects.toThrow(NotFoundError);
  });
});
