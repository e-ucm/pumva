import request from 'supertest';
import { app } from '@/app';
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from '@/lib/logger';

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

  it("GET heath return ok", async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it("GET returns empty array initially", async () => {
    const response = await request(app).get('/users');
    expect(response).toBeDefined();
    if(response) {
      expect(response).toEqual([]);
    }
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
    expect(response.user_id).toBeDefined();
    expect(response.username).toBe("Charlie");
  });

  it("GET returns user after creation", async () => {
    const response = await request(app).get('/users').send(JSON.stringify({ params: { username: "Charlie" }}));
    expect(response).toBeDefined();
    logger.info(response);
    expect(response.username).toBe("Charlie");
  });

  it("GET returns none user for username that doesn't exist", async () => {
    const response = await request(app).get('/users').send(JSON.stringify({ params: { username: "Toto" }}));
    logger.info(response);
    expect(response).toBeNull();
  });
});
