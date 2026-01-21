import { createTechnology, getTechnologies, getTechnologyById, updateTechnologies, updateTechnology, deleteTechnologies, deleteTechnologyById } from "@/services/technology.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { NotFoundError } from "@/lib/errors/appErrors";

var technology : InstanceType<typeof db.Tables.Technology> | null;

/**
 * Integration tests for technology service CRUD operations and error handling.
 */
describe("Technology service", () => {
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

  it("update technology by id should throw when not technology id defined", async () => {
      expect.assertions(1);
      await expect(updateTechnology(9999, { technology: "Tot" })).rejects.toThrow(NotFoundError);
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
      let deleted_technology = await getTechnologyById(technology!.technology_id);
      expect(deleted_technology).toBeNull();
    });

    it("delete technology by id should throw when not technology id defined", async () => {
        expect.assertions(1);
        await expect(deleteTechnologyById(technology!.technology_id)).rejects.toThrow(NotFoundError);
    });
});