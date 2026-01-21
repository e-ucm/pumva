import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as userService from "@/services/user.service";

/**
 * HTTP API tests for user controller endpoints.
 */
describe("User Controller /users", () => {
  let testUserId: number;

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

  it("GET /users returns empty array initially", async () => {
    const response = await request(app).get('/users');
    const data: InstanceType<typeof db.Tables.User>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /users creates a user", async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: "testuser",
        email: "test@example.com",
        role: "student"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.User> = response.body;
    expect(data.user_id).toBeDefined();
    expect(data.username).toBe("testuser");
    expect(data.email).toBe("test@example.com");
    expect(data.role).toBe("student");
    
    testUserId = data.user_id;
  });

  it("POST /users creates another user", async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: "anotheruser",
        email: "another@example.com",
        role: "teacher"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.username).toBe("anotheruser");
  });

  it("GET /users returns all users after creation", async () => {
    const response = await request(app).get('/users');
    const data: InstanceType<typeof db.Tables.User>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /users?username=X returns user by username", async () => {
    const response = await request(app)
      .get('/users')
      .query({ username: "testuser" });

    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.User> = response.body;
    expect(data.username).toBe("testuser");
    expect(data.email).toBe("test@example.com");
  });

  it("GET /users?username=X returns 404 for non-existent username", async () => {
    const response = await request(app)
      .get('/users')
      .query({ username: "nonexistent" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("DELETE /users/:id deletes user by id", async () => {
    const response = await request(app)
      .delete(`/users/${testUserId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /users/:id returns 404 for non-existent user", async () => {
    const response = await request(app)
      .delete('/users/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it("GET /users handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(userService, 'getUsers').mockRejectedValueOnce(mockError);

    const response = await request(app).get('/users');

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /users handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(userService, 'createUser').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/users')
      .send({
        username: "testuser",
        email: "test@example.com",
        role: "student"
      });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});
