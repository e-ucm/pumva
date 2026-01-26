import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all trackers from the database.
 * 
 * @async
 * @function getTrackers
 * @returns {Promise<Array>} Array of all tracker records
 * 
 * @example
 * ```typescript
 * const trackers = await getTrackers();
 * ```
 */
export async function getTrackers(): Promise<InstanceType<typeof db.Tables.Tracker>[]> {
  return db.Tables.Tracker.findAll();
}

/**
 * Retrieves a single tracker by its ID.
 * 
 * @async
 * @function getTrackerById
 * @param {number} tracker_id - The tracker identifier
 * @returns {Promise<InstanceType<typeof db.Tables.Tracker>>} The tracker record
 * @throws {NotFoundError} If tracker with given ID does not exist
 * 
 * @example
 * ```typescript
 * const tracker = await getTrackerById(1);
 * ```
 */
export async function getTrackerById(tracker_id : number): Promise<InstanceType<typeof db.Tables.Tracker>> {
    const result = await db.Tables.Tracker.findByPk(tracker_id);
    if (!result) {
      throw new NotFoundError("Tracker not found");
    }
    return result;
}

/**
 * Creates a new tracker in the database.
 * 
 * @async
 * @function createTracker
 * @param {number} technology_id - Technology ID this tracker belongs to
 * @param {string} tracker - Tracker name (e.g., 'Xasu', 'JSTracker')
 * @returns {Promise<Object>} The created tracker record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const tracker = await createTracker(1, 'JSTracker');
 * ```
 */
export async function createTracker(technology_id: number ,tracker: string) : Promise<InstanceType<typeof db.Tables.Tracker>> {
  return db.Tables.Tracker.create({ technology_id, tracker });
}

/**
 * Updates multiple trackers matching a condition.
 * 
 * @async
 * @function updateTrackers
 * @param {Object} where - Condition to find trackers to update
 * @param {Object} payload - Partial tracker data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateTrackers({ technology_id: 1 }, { tracker: 'Xasu 2' });
 * ```
 */
export async function updateTrackers(where: Partial<InstanceType<typeof db.Tables.Tracker>>, payload : Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<number> {
  const [affectedRows] = await db.Tables.Tracker.update(payload, { where : where });
  return affectedRows;
}

/**
 * Updates a single tracker by ID within a transaction.
 * 
 * @async
 * @function updateTracker
 * @param {number} trackerId - The tracker identifier
 * @param {Object} payload - Partial tracker data to update
 * @returns {Promise<Object>} The updated tracker record
 * 
 * @throws {NotFoundError} If tracker with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateTracker(1, { tracker: 'JSTracker v2' });
 * ```
 */
export async function updateTracker(trackerId: number, payload: Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<InstanceType<typeof db.Tables.Tracker>> {
  return db.sequelize.transaction(async (t) => {
    const tracker = await db.Tables.Tracker.findByPk(trackerId, { transaction: t });
    if (!tracker) {
      throw new NotFoundError("Tracker not found");
    }
    await tracker.update(payload, { transaction: t });
    return tracker;
  });
}

/**
 * Deletes a single tracker by ID within a transaction.
 * 
 * @async
 * @function deleteTrackerById
 * @param {number} trackerId - The tracker identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If tracker with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteTrackerById(1);
 * ```
 */
export async function deleteTrackerById(trackerId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const tracker = await db.Tables.Tracker.findByPk(trackerId, { transaction: t });
    if (!tracker) {
      throw new NotFoundError("Tracker not found");
    }
    await tracker.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple trackers matching a condition.
 * 
 * @async
 * @function deleteTrackers
 * @param {Object} where - Condition to find trackers to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteTrackers({ tracker_id: 1 });
 * ```
 */
export async function deleteTrackers(where: Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<number> {
  return db.Tables.Tracker.destroy({ where });
}