import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedUsers, seedTechnologies, seedTrackers, seedGames, seedLanguages, seedTeachersGuides } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for teacher guides.
 */
describe("TeacherGuide DB", () => {
  let testGame: InstanceType<typeof db.Tables.Game> | null;
  let testUser: InstanceType<typeof db.Tables.User> | null;
  let testTechnology: InstanceType<typeof db.Tables.Technology> | null;
  let testTracker: InstanceType<typeof db.Tables.Tracker> | null;
  let testLanguage: InstanceType<typeof db.Tables.Language> | null;
  let teacherGuide: InstanceType<typeof db.Tables.TeacherGuide> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

      // Create dependencies
      testUser = await db.Tables.User.create({
        username: "guideauthor",
        email: "author@test.com",
        role: "teacher"
      });

      testTechnology = await db.Tables.Technology.create({
        technology: "Phaser"
      });

      testTracker = await db.Tables.Tracker.create({
        technology_id: testTechnology.technology_id,
        tracker: "phaser_tracker"
      });

      testGame = await db.Tables.Game.create({
        name: "Test Game for Guide",
        owner_id: testUser.user_id,
        public: true,
        description: "A test game for guides",
        type: "WEB",
        technology_id: testTechnology.technology_id,
        tracker_id: testTracker.tracker_id,
        external_url: "https://example.com/game"
      });

      testLanguage = await db.Tables.Language.create({
        language: "Spanish"
      });
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a teacher guide if not present", async () => {
    teacherGuide = await db.Tables.TeacherGuide.create({
      game_id: testGame!.game_id,
      language_id: testLanguage!.language_id,
      url: "https://example.com/guides/game-es"
    });
    expect(teacherGuide.game_id).toBe(testGame!.game_id);
    expect(teacherGuide.language_id).toBe(testLanguage!.language_id);
    expect(teacherGuide.url).toBe("https://example.com/guides/game-es");
  });

  it("should find all teacher guides", async () => {
    const guides = await db.Tables.TeacherGuide.findAll();
    expect(guides.length).toBeGreaterThanOrEqual(1);
    expect(guides[0].url).toBe("https://example.com/guides/game-es");
  });

  it("should find teacher guide by composite key", async () => {
    const foundGuide = await db.Tables.TeacherGuide.findOne({
      where: {
        game_id: testGame!.game_id,
        language_id: testLanguage!.language_id
      }
    });
    expect(foundGuide).toBeDefined();
    expect(foundGuide!.url).toBe("https://example.com/guides/game-es");
  });

  it("generate 50 teacher guides into DB", async () => {
    await seedUsers(5);
    await seedGames(10);
    await seedLanguages(10);
    await seedTeachersGuides(50);
    const guides = await db.Tables.TeacherGuide.findAll();
    expect(guides.length).toBeGreaterThanOrEqual(50);
  });
});
