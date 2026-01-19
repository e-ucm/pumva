import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedTechnologies, seedTrackers } from "@/lib/seeds/seedFakeData";

var technology : InstanceType<typeof db.Tables.Technology> | null;
var tracker : InstanceType<typeof db.Tables.Tracker> | null;

/**
 * Verifies direct Sequelize interactions and seeded data for trackers.
 */
describe("Sequelize + SQLite", () => {
  beforeAll(async () => {
      try {
        await db.sequelize.sync({ force: true });
        await db.Functions.runSqlFile(config.db.views_sql_file);
        technology = await db.Tables.Technology.create({technology: "Godot"});
      } catch (err) {
        console.error("Sequelize sync failed:", err);
      }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a tracker if not present", async () => {
    tracker = await db.Tables.Tracker.create({technology_id: technology!.technology_id, tracker: "myNewTracker"});
    expect(tracker.tracker_id).toBeDefined();
    expect(tracker.tracker).toBe("myNewTracker");
    expect(tracker.tracker_id).toBe(technology!.technology_id);
  });

  it("should find all trackers", async () => {
    const trackers = await db.Tables.Tracker.findAll();
    expect(trackers.length).toBeGreaterThanOrEqual(1);
    expect(trackers[0].tracker).toBe("myNewTracker");
  });

  it("generate 2 trackers into DB", async () => {
    await seedTechnologies(7);
    await seedTrackers(2);
    const trackers = await db.Tables.Tracker.findAll();
    expect(trackers.length).toBeGreaterThanOrEqual(2);
    expect(trackers[0].tracker_id).toBeDefined();
  });
});