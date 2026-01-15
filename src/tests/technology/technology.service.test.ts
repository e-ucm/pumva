import { createTechnology, getTechnologies, getTechnologyById, updateTechnologies, updateTechnology, deleteTechnologies, deleteTechnologyById } from "@/lib/services/technology.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

var technology : InstanceType<typeof db.Tables.Technology> | null;

describe("Technology service", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
    } catch (err) {
      console.error("Sequelize sync failed:", err);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it("creates a technology", async () => {
    technology = await createTechnology("Phaser");
    expect(technology).toBeDefined();
    if(technology) {
      expect(technology.technology_id).toBeDefined();
      expect(technology.technology).toBe("Phaser");
    }
  });

  it("fetches technologies", async () => {
    const technologies = await getTechnologies();
    expect(technologies.length).toBeGreaterThanOrEqual(1);
  });

  it("update technology by Id", async () => {
    technology = await updateTechnology(technology!.technology_id, { technology: "Godot" });
    expect(technology).toBeDefined();
    if(technology) {
      expect(technology.technology_id).toBeDefined();
      expect(technology.technology).toBe("Godot");
    }
  });

  
  it("update technologies", async () => {
    const nb = await updateTechnologies({ technology: "Godot" }, { technology : "Engine Real 5"});
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    technology = await getTechnologyById(technology!.technology_id);
    if(technology) {
      expect(technology.technology_id).toBeDefined();
      expect(technology.technology).toBe("Engine Real 5");
    }
  });

    it("delete technologies", async () => {
      const nb = await deleteTechnologies({ technology_id: technology!.technology_id });
      expect(nb).toBeDefined();
      expect(nb).toBe(1);
      const technologies = await getTechnologies();
      expect(technologies.length).toBeGreaterThanOrEqual(0);
      technology = await getTechnologyById(technology!.technology_id);
      expect(technology).toBeNull();
    });

    it("delete technology by id", async () => {
      technology = await createTechnology("RPG Maker");
      expect(technology).toBeDefined();
      await deleteTechnologyById(technology!.technology_id);
      technology = await getTechnologyById(technology!.technology_id);
      expect(technology).toBeNull();
    });
});