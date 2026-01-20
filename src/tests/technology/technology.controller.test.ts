import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

/**
 * HTTP API tests for technology controller endpoints.
 */
describe("Technology Controller /technologies", () => {
  let testTechnologyId: number;

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

  it("GET /technologies returns empty array initially", async () => {
    const response = await request(app).get('/technologies');
    const data: InstanceType<typeof db.Tables.Technology>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /technologies creates a technology", async () => {
    const response = await request(app)
      .post('/technologies')
      .send({
        technology: "Unity"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology_id).toBeDefined();
    expect(data.technology).toBe("Unity");
    
    testTechnologyId = data.technology_id;
  });

  it("POST /technologies creates another technology", async () => {
    const response = await request(app)
      .post('/technologies')
      .send({
        technology: "Unreal Engine"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.technology).toBe("Unreal Engine");
  });

  it("GET /technologies returns all technologies after creation", async () => {
    const response = await request(app).get('/technologies');
    const data: InstanceType<typeof db.Tables.Technology>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /technologies/:id returns technology by id", async () => {
    const response = await request(app)
      .get(`/technologies/${testTechnologyId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology_id).toBe(testTechnologyId);
    expect(data.technology).toBe("Unity");
  });

  it("GET /technologies/:id returns 404 for non-existent technology", async () => {
    const response = await request(app)
      .get('/technologies/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Technology not found');
  });

  it("PUT /technologies/:id updates technology", async () => {
    const response = await request(app)
      .put(`/technologies/${testTechnologyId}`)
      .send({
        technology: "Unity 3D"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Technology> = response.body;
    expect(data.technology).toBe("Unity 3D");
  });

  it("DELETE /technologies/:id deletes technology by id", async () => {
    const response = await request(app)
      .delete(`/technologies/${testTechnologyId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /technologies/:id returns 404 for non-existent technology", async () => {
    const response = await request(app)
      .delete('/technologies/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Technology not found');
  });
});