import { 
  createLanguage, 
  getLanguages, 
  getLanguageById, 
  updateLanguages, 
  updateLanguageById, 
  deleteLanguages, 
  deleteLanguageById 
} from "@/services/language.service";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { config } from "@/lib/config";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Integration tests for language service CRUD operations and error handling.
 */
describe("Language service", () => {
  let language: InstanceType<typeof db.Tables.Language> | null;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      
    } catch (err) {
      logger.error({ err }, "Setup failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a language", async () => {
    language = await createLanguage({ language: "English" });
    expect(language).toBeDefined();
    expect(language.language_id).toBeDefined();
    expect(language.language).toBe("English");
  });

  it("fetches languages", async () => {
    const languages = await getLanguages();
    expect(languages.length).toBeGreaterThanOrEqual(1);
  });

  it("gets language by id", async () => {
    const lang = await getLanguageById(language!.language_id);
    expect(lang).toBeDefined();
    expect(lang!.language).toBe("English");
  });

  it("update language by id", async () => {
    language = await updateLanguageById(
      language!.language_id,
      { language: "English (US)" }
    );
    expect(language).toBeDefined();
    expect(language.language).toBe("English (US)");
  });

  it("update language by id should throw when language not found", async () => {
    expect.assertions(1);
    await expect(
      updateLanguageById(9999, { language: "NotFound" })
    ).rejects.toThrow(NotFoundError);
  });

  it("update languages", async () => {
    const nb = await updateLanguages(
      { language: "English (US)" },
      { language: "English (United States)" }
    );
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    
    language = await getLanguageById(language!.language_id);
    expect(language!.language).toBe("English (United States)");
  });

  it("creates multiple languages", async () => {
    const spanish = await createLanguage({ language: "Spanish" });
    const french = await createLanguage({ language: "French" });
    
    expect(spanish).toBeDefined();
    expect(spanish.language).toBe("Spanish");
    expect(french).toBeDefined();
    expect(french.language).toBe("French");
    
    const languages = await getLanguages();
    expect(languages.length).toBeGreaterThanOrEqual(3);
  });

  it("delete languages by condition", async () => {
    const nb = await deleteLanguages({ language: "French" });
    expect(nb).toBe(1);
    
    const languages = await getLanguages();
    const hasFrench = languages.some(l => l.language === "French");
    expect(hasFrench).toBe(false);
  });

  it("delete language by id", async () => {
    const german = await createLanguage({ language: "German" });
    expect(german).toBeDefined();
    
    await deleteLanguageById(german.language_id);
    await expect(getLanguageById(german.language_id)).rejects.toThrow(NotFoundError);
  });

  it("delete language by id should throw when language not found", async () => {
    expect.assertions(1);
    await expect(
      deleteLanguageById(9999)
    ).rejects.toThrow(NotFoundError);
  });
});
