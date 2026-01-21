import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedTechnologies } from "@/lib/seeds/seedFakeData";

/**
 * Verifies direct Sequelize interactions and seeded data for technologies.
 */
var technology : InstanceType<typeof db.Tables.Technology> | null;
describe("Sequelize + SQLite", () => {
  beforeAll(async () => {
      try {
        await db.sequelize.sync({ force: true });
        
      } catch (err) {
        logger.error({ err }, "Sequelize sync failed");
      }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a technology if not present", async () => {
    technology = await db.Tables.Technology.create({ technology: "Godot" });
    expect(technology.technology_id).toBeDefined();
    expect(technology.technology).toBe("Godot");
  });

  it("should find all technologies", async () => {
    const technologies = await db.Tables.Technology.findAll();
    expect(technologies.length).toBeGreaterThanOrEqual(1);
    expect(technologies[0].technology).toBe("Godot");
  });

  it("generate 7 technologies into DB", async () => {
    await seedTechnologies(7);
    const technologies = await db.Tables.Technology.findAll();
    expect(technologies.length).toBeGreaterThanOrEqual(7);
    expect(technologies[0].technology_id).toBeDefined();
  });
});
