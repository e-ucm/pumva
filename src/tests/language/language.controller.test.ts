import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

/**
 * HTTP API tests for language controller endpoints.
 */
describe("Language Controller /languages", () => {
  let testLanguageId: number;

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

  it("GET /languages returns empty array initially", async () => {
    const response = await request(app).get('/languages');
    const data: InstanceType<typeof db.Tables.Language>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /languages creates a language", async () => {
    const response = await request(app)
      .post('/languages')
      .send({
        language: "English"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language_id).toBeDefined();
    expect(data.language).toBe("English");
    
    testLanguageId = data.language_id;
  });

  it("POST /languages creates another language", async () => {
    const response = await request(app)
      .post('/languages')
      .send({
        language: "Spanish"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.language).toBe("Spanish");
  });

  it("GET /languages returns all languages after creation", async () => {
    const response = await request(app).get('/languages');
    const data: InstanceType<typeof db.Tables.Language>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /languages/:id returns language by id", async () => {
    const response = await request(app)
      .get(`/languages/${testLanguageId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language_id).toBe(testLanguageId);
    expect(data.language).toBe("English");
  });

  it("GET /languages/:id returns 404 for non-existent language", async () => {
    const response = await request(app)
      .get('/languages/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Language not found');
  });

  it("PUT /languages/:id updates language", async () => {
    const response = await request(app)
      .put(`/languages/${testLanguageId}`)
      .send({
        language: "English (US)"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Language> = response.body;
    expect(data.language).toBe("English (US)");
  });

  it("DELETE /languages/:id deletes language by id", async () => {
    const response = await request(app)
      .delete(`/languages/${testLanguageId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /languages/:id returns 404 for non-existent language", async () => {
    const response = await request(app)
      .delete('/languages/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Language not found');
  });
});