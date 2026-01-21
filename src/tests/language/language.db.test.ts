import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedLanguages } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for languages.
 */
describe("Language DB", () => {
  let language: InstanceType<typeof db.Tables.Language> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a language if not present", async () => {
    language = await db.Tables.Language.create({
      language: "English"
    });
    expect(language.language_id).toBeDefined();
    expect(language.language).toBe("English");
  });

  it("should find all languages", async () => {
    const languages = await db.Tables.Language.findAll();
    expect(languages.length).toBeGreaterThanOrEqual(1);
    expect(languages[0].language).toBe("English");
  });

  it("should find language by primary key", async () => {
    const foundLang = await db.Tables.Language.findByPk(language!.language_id);
    expect(foundLang).toBeDefined();
    expect(foundLang!.language).toBe("English");
  });

  it("generate 10 languages into DB", async () => {
    await seedLanguages(10);
    const languages = await db.Tables.Language.findAll();
    expect(languages.length).toBeGreaterThanOrEqual(10);
    expect(languages[0].language_id).toBeDefined();
  });
});
