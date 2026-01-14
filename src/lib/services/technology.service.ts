import { db } from "@/lib/db";
/**
 * Get the list of technologies
 * @returns list of technologies
 */
export async function getTechnologies() : Promise<InstanceType<typeof db.Tables.Technology>[]> {
  return db.Tables.Technology.findAll();
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
 * Delete a technology 
 * @param technology_id the id of the technology to delete
 * @returns the number of technology row deleted (normally 1) 
 */
export async function deleteTechnology(technology_id: number): Promise<number>  {
  return db.Tables.Technology.destroy({ where : { technology_id }});
}