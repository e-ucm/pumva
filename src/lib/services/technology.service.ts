import { db } from "@/lib/db";
/**
 * Get the list of technologies
 * @returns list of technologies
 */
export async function getTechnologies() : Promise<InstanceType<typeof db.Tables.Technology>[]> {
  return db.Tables.Technology.findAll();
}

/**
 * Get technology by its technology_id
 * @param technology_id technology identifier
 * @returns specified technology
 */
export async function getTechnologyById(technology_id : number): Promise<InstanceType<typeof db.Tables.Technology> | null> {
    const result = await db.Tables.Technology.findByPk(technology_id);
    return result;
}

/**
 * Create a technology
 * @param technology technology name
 * @returns the technology created
 */
export async function createTechnology(technology: string) : Promise<InstanceType<typeof db.Tables.Technology>> {
  return db.Tables.Technology.create({ technology });
}

/**
 * Update BULK technologies
 * @param where options to select technologies to update
 * @param payload partial technology to updates
 * @returns the number of updated technologies
 */
export async function updateTechnologies(where: Partial<InstanceType<typeof db.Tables.Technology>>, payload : Partial<InstanceType<typeof db.Tables.Technology>>): Promise<number> {
  const [affectedRows] = await db.Tables.Technology.update(payload, { where : where });
  return affectedRows;
}

/**
 * Update ONE technology
 * @param technologyId technology identifier
 * @param payload partial technology to update
 * @returns the updated technology 
 */
export async function updateTechnology(technologyId: number, payload: Partial<InstanceType<typeof db.Tables.Technology>>): Promise<InstanceType<typeof db.Tables.Technology>> {
  return db.sequelize.transaction(async (t) => {
    const technology = await db.Tables.Technology.findByPk(technologyId, { transaction: t });
    if (!technology) {
      throw new Error("Technology not found");
    }
    await technology.update(payload, { transaction: t });
    return technology;
  });
}

/**
 * Delete technology
 * @param technologyId technology identifier to delete
 */
export async function deleteTechnologyById(technologyId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const technology = await db.Tables.Technology.findByPk(technologyId, { transaction: t });
    if (!technology) {
      throw new Error("Technology not found");
    }
    await technology.destroy({ transaction: t });
  });
}

/**
 * Delete technologies
 * @param where options to select technologies to delete
 * @returns the number of technologies row deleted
 */
export async function deleteTechnologies(where: Partial<InstanceType<typeof db.Tables.Technology>>): Promise<number> {
  return db.Tables.Technology.destroy({ where });
}