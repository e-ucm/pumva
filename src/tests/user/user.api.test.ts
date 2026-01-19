import request from 'supertest';
import { app } from '@/app';
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger';

/**
 * HTTP API tests for user endpoints.
 */
describe("/api/users", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
    } catch (err) {
      console.error("Sequelize sync failed:", err);
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET returns empty array initially", async () => {
    const response = await request(app).get('/users');
    const data : InstanceType<typeof db.Tables.User>[] = response.body;
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST creates a user", async () => {
    const response = await request(app).post('/users')
        .send({
          username: "Charlie",
          email: "charlie@test.com",
          role: "tester",
        });
    expect(response).toBeDefined();
    logger.info(response);
    const data : InstanceType<typeof db.Tables.User> = response.body;
    logger.info(data);
    expect(data.user_id).toBeDefined();
    expect(data.username).toBe("Charlie");
  });

  it("GET returns user after creation", async () => {
    const response = await request(app).get('/users').query({ username: "Charlie" });
    expect(response).toBeDefined();
    const data : InstanceType<typeof db.Tables.User> = response.body;
    logger.info(data);
    expect(data.username).toBe("Charlie");
  });

  it("GET returns none user for username that doesn't exist", async () => {
    const response = await request(app).get('/users').query({ username: "Toto" });
    logger.info(response.body);
    expect(response.body).toBeNull();
  });
});
