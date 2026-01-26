import { createTracker, getTrackers, getTrackerById, updateTrackers, updateTracker, deleteTrackers, deleteTrackerById } from "@/services/games/tracker.service";
import { createTechnology } from "@/services/games/technology.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { NotFoundError } from "@/lib/errors/appErrors";


var technology : InstanceType<typeof db.Tables.Technology> | null;
var tracker : InstanceType<typeof db.Tables.Tracker> | null;

/**
 * Integration tests for tracker service CRUD operations and error scenarios.
 */
describe("Tracker service", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      
      technology = await createTechnology("Phaser");
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a tracker", async () => {
    tracker = await createTracker(technology!.technology_id, "JSTracker");
    expect(tracker).toBeDefined();
    if(tracker) {
      expect(tracker.tracker_id).toBeDefined();
      expect(tracker.technology_id).toBe(technology!.technology_id);
      expect(tracker.tracker).toBe("JSTracker");
    }
  });

  it("fetches trackers", async () => {
    const trackers = await getTrackers();
    expect(trackers.length).toBeGreaterThanOrEqual(1);
  });

  it("update tracker by Id", async () => {
    tracker = await updateTracker(tracker!.tracker_id, { tracker: "MyJSTracker" });
    expect(tracker).toBeDefined();
    if(tracker) {
      expect(tracker.tracker_id).toBeDefined();
      expect(tracker.tracker).toBe("MyJSTracker");
    }
  });

  it("update tracker by id should throw when not tracker id defined", async () => {
      expect.assertions(1);
      await expect(updateTracker(9999, { tracker: "Tot" })).rejects.toThrow(NotFoundError);
  });

  it("update trackers", async () => {
    const nb = await updateTrackers({ tracker: "MyJSTracker" }, { tracker : "MyJSTracker2"});
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    tracker = await getTrackerById(tracker!.tracker_id);
    if(tracker) {
      expect(tracker.tracker_id).toBeDefined();
      expect(tracker.tracker).toBe("MyJSTracker2");
    }
  });

    it("delete trackers", async () => {
      const nb = await deleteTrackers({ tracker_id: tracker!.tracker_id });
      expect(nb).toBeDefined();
      expect(nb).toBe(1);
      const trackers = await getTrackers();
      expect(trackers.length).toBeGreaterThanOrEqual(0);
      await expect(getTrackerById(tracker!.tracker_id)).rejects.toThrow(NotFoundError);
    });

    it("delete tracker by id", async () => {
      tracker = await createTracker(technology!.technology_id, "JavaScriptTracker");
      expect(tracker).toBeDefined();
      expect(tracker!.tracker_id).toBeDefined();
      await deleteTrackerById(tracker!.tracker_id);
      await expect(getTrackerById(tracker!.tracker_id)).rejects.toThrow(NotFoundError);
    });

    it("delete tracker by id should throw when not tracker id defined", async () => {
      expect.assertions(1);
      await expect(deleteTrackerById(999999)).rejects.toThrow(NotFoundError);
    });
});