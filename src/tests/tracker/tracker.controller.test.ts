import request from 'supertest';
import { app } from '@/app';
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import * as trackerService from "@/services/tracker.service";

/**
 * HTTP API tests for tracker controller endpoints.
 */
describe("Tracker Controller /trackers", () => {
  let testTrackerId: number;
  let testTechnologyId: number;
  let testUserId: number;

  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);

      // Create a technology first for tracker creation
      const technology = await db.Tables.Technology.create({
        technology: "Unity"
      });
      testTechnologyId = technology.technology_id;
      const user = await db.Tables.User.create({
        username: "gameowner",
        email: "gameowner@test.com",
        role: "teacher"
      });
      testUserId = user.user_id;
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("GET /trackers returns empty array initially", async () => {
    const response = await request(app).get('/trackers');
    const data: InstanceType<typeof db.Tables.Tracker>[] = response.body;
    
    expect(data).toBeDefined();
    expect(data).toEqual([]);
  });

  it("POST /trackers creates a tracker", async () => {
    const response = await request(app)
      .post('/trackers')
      .send({
        technology_id: testTechnologyId,
        tracker: "Xasu"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Tracker> = response.body;
    expect(data.tracker_id).toBeDefined();
    expect(data.technology_id).toBe(testTechnologyId);
    expect(data.tracker).toBe("Xasu");
    
    testTrackerId = data.tracker_id;
  });

  it("POST /trackers creates another tracker", async () => {
    const response = await request(app)
      .post('/trackers')
      .send({
        technology_id: testTechnologyId,
        tracker: "JSTracker"
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.tracker).toBe("JSTracker");
  });

  it("GET /trackers returns all trackers after creation", async () => {
    const response = await request(app).get('/trackers');
    const data: InstanceType<typeof db.Tables.Tracker>[] = response.body;
    
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /trackers/:id returns tracker by id", async () => {
    const response = await request(app)
      .get(`/trackers/${testTrackerId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Tracker> = response.body;
    expect(data.tracker_id).toBe(testTrackerId);
    expect(data.tracker).toBe("Xasu");
    expect(data.technology_id).toBe(testTechnologyId);
  });

  it("GET /trackers/:id returns 404 for non-existent tracker", async () => {
    const response = await request(app)
      .get('/trackers/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tracker not found');
  });

  it("PUT /trackers/:id updates tracker", async () => {
    const response = await request(app)
      .put(`/trackers/${testTrackerId}`)
      .send({
        tracker: "Updated Xasu"
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    
    const data: InstanceType<typeof db.Tables.Tracker> = response.body;
    expect(data.tracker).toBe("Updated Xasu");
  });

  it("DELETE /trackers/:id deletes tracker by id", async () => {
    const response = await request(app)
      .delete(`/trackers/${testTrackerId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("DELETE /trackers/:id returns 404 for non-existent tracker", async () => {
    const response = await request(app)
      .delete('/trackers/99999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Tracker not found');
  });

  it("GET /trackers handles service errors", async () => {
    const mockError = new Error('Database connection failed');
    jest.spyOn(trackerService, 'getTrackers').mockRejectedValueOnce(mockError);

    const response = await request(app).get('/trackers');

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("POST /trackers handles service errors", async () => {
    const mockError = new Error('Creation failed');
    jest.spyOn(trackerService, 'createTracker').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post('/trackers')
      .send({ tracker: "Test Tracker", technology_id: testTechnologyId });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });

  it("PUT /trackers/:id handles service errors", async () => {
    const mockError = new Error('Update failed');
    jest.spyOn(trackerService, 'updateTracker').mockRejectedValueOnce(mockError);

    const response = await request(app)
      .put('/trackers/1')
      .send({ tracker: "Updated Tracker" });

    expect(response.status).toBe(500);
    
    jest.restoreAllMocks();
  });
});