import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all technologies from the database.
 * 
 * @async
 * @function getTechnologies
 * @returns {Promise<Array>} Array of all technology records
 * 
 * @example
 * ```typescript
 * const technologies = await getTechnologies();
 * ```
 */
export async function getTechnologies() : Promise<InstanceType<typeof db.Tables.Technology>[]> {
  return db.Tables.Technology.findAll();
}

/**
 * Retrieves a single technology by its ID.
 * 
 * @async
 * @function getTechnologyById
 * @param {number} technology_id - The technology identifier
 * @returns {Promise<InstanceType<typeof db.Tables.Technology>>} The technology record
 * @throws {NotFoundError} If technology with given ID does not exist
 * 
 * @example
 * ```typescript
 * const tech = await getTechnologyById(1);
 * ```
 */
export async function getTechnologyById(technology_id : number): Promise<InstanceType<typeof db.Tables.Technology>> {
    const result = await db.Tables.Technology.findByPk(technology_id);
    if (!result) {
      throw new NotFoundError("Technology not found");
    }
    return result;
}

/**
 * Creates a new technology in the database.
 * 
 * @async
 * @function createTechnology
 * @param {string} technology - Technology name (e.g., 'Unity', 'Unreal Engine')
 * @returns {Promise<Object>} The created technology record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const tech = await createTechnology('Godot');
 * ```
 */
export async function createTechnology(technology: string) : Promise<InstanceType<typeof db.Tables.Technology>> {
  return db.Tables.Technology.create({ technology });
}

/**
 * Updates multiple technologies matching a condition.
 * 
 * @async
 * @function updateTechnologies
 * @param {Object} where - Condition to find technologies to update
 * @param {Object} payload - Partial technology data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateTechnologies({ technology: 'Unity' }, { technology: 'Unity 6' });
 * ```
 */
export async function updateTechnologies(where: Partial<InstanceType<typeof db.Tables.Technology>>, payload : Partial<InstanceType<typeof db.Tables.Technology>>): Promise<number> {
  const [affectedRows] = await db.Tables.Technology.update(payload, { where : where });
  return affectedRows;
}

/**
 * Updates a single technology by ID within a transaction.
 * 
 * @async
 * @function updateTechnology
 * @param {number} technologyId - The technology identifier
 * @param {Object} payload - Partial technology data to update
 * @returns {Promise<Object>} The updated technology record
 * 
 * @throws {NotFoundError} If technology with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateTechnology(1, { technology: 'Unreal Engine 5' });
 * ```
 */
export async function updateTechnology(technologyId: number, payload: Partial<InstanceType<typeof db.Tables.Technology>>): Promise<InstanceType<typeof db.Tables.Technology>> {
  return db.sequelize.transaction(async (t) => {
    const technology = await db.Tables.Technology.findByPk(technologyId, { transaction: t });
    if (!technology) {
      throw new NotFoundError("Technology not found");
    }
    await technology.update(payload, { transaction: t });
    return technology;
  });
}

/**
 * Deletes a single technology by ID within a transaction.
 * 
 * @async
 * @function deleteTechnologyById
 * @param {number} technologyId - The technology identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If technology with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteTechnologyById(1);
 * ```
 */
export async function deleteTechnologyById(technologyId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const technology = await db.Tables.Technology.findByPk(technologyId, { transaction: t });
    if (!technology) {
      throw new NotFoundError("Technology not found");
    }
    await technology.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple technologies matching a condition.
 * 
 * @async
 * @function deleteTechnologies
 * @param {Object} where - Condition to find technologies to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteTechnologies({ technology_id: 1 });
 * ```
 */
export async function deleteTechnologies(where: Partial<InstanceType<typeof db.Tables.Technology>>): Promise<number> {
  return db.Tables.Technology.destroy({ where });
}