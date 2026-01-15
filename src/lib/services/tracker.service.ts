import { db } from "@/lib/db";

/**
 * Get the list of trackers
 * @returns list of trackers
 */
export async function getTrackers(): Promise<InstanceType<typeof db.Tables.Tracker>[]> {
  return db.Tables.Tracker.findAll();
}


/**
 * Get tracker by its tracker_id
 * @param tracker_id tracker identifier
 * @returns specified tracker
 */
export async function getTrackerById(tracker_id : number): Promise<InstanceType<typeof db.Tables.Tracker> | null> {
    const result = await db.Tables.Tracker.findByPk(tracker_id);
    return result;
}

/**
 * Create a tracker
 * @param technology_id technology identifier
 * @param tracker tracker name
 * @returns the tracker created
 */
export async function createTracker(technology_id: number ,tracker: string) : Promise<InstanceType<typeof db.Tables.Tracker>> {
  return db.Tables.Tracker.create({ technology_id, tracker });
}

/**
 * Update BULK trackers
 * @param where options to select trackers to update
 * @param payload partial tracker to updates
 * @returns the number of updated trackers
 */
export async function updateTrackers(where: Partial<InstanceType<typeof db.Tables.Tracker>>, payload : Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<number> {
  const [affectedRows] = await db.Tables.Tracker.update(payload, { where : where });
  return affectedRows;
}

/**
 * Update ONE tracker
 * @param trackerId tracker identifier
 * @param payload partial tracker to update
 * @returns the updated tracker 
 */
export async function updateTracker(trackerId: number, payload: Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<InstanceType<typeof db.Tables.Tracker>> {
  return db.sequelize.transaction(async (t) => {
    const tracker = await db.Tables.Tracker.findByPk(trackerId, { transaction: t });
    if (!tracker) {
      throw new Error("Tracker not found");
    }
    await tracker.update(payload, { transaction: t });
    return tracker;
  });
}

/**
 * Delete tracker
 * @param trackerId tracker identifier to delete
 */
export async function deleteTrackerById(trackerId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const tracker = await db.Tables.Tracker.findByPk(trackerId, { transaction: t });
    if (!tracker) {
      throw new Error("Tracker not found");
    }
    await tracker.destroy({ transaction: t });
  });
}

/**
 * Delete trackers
 * @param where options to select trackers to delete
 * @returns the number of trackers row deleted
 */
export async function deleteTrackers(where: Partial<InstanceType<typeof db.Tables.Tracker>>): Promise<number> {
  return db.Tables.Tracker.destroy({ where });
}