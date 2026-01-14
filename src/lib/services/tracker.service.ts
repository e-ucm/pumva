import { db } from "@/lib/db";

/**
 * Get the list of trackers
 * @returns list of trackers
 */
export async function getTrackers(): Promise<InstanceType<typeof db.Tables.Tracker>[]> {
  return db.Tables.Tracker.findAll();
}

/**
 * Create a tracker
 * @param tracker tracker name
 * @returns the tracker created
 */
export async function createTracker(technology_id: number ,tracker: string) : Promise<InstanceType<typeof db.Tables.Tracker>> {
  return db.Tables.Tracker.create({ technology_id, tracker });
}

/**
 * Delete a tracker 
 * @param tracker_id the id of the tracker to delete
 * @returns the number of tracker row deleted (normally 1)
 */
export async function deleteTracker(tracker_id: number): Promise<number>  {
  return db.Tables.Tracker.destroy({ where : { tracker_id }});
}