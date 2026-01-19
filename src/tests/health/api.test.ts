import request from 'supertest';
import { app } from '@/app';
import { config } from "@/lib/config";
import { db } from "@/lib/db";

describe("/api", () => {
  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET heath return ok", async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
