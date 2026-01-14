import { db } from "@/lib/db";
/**
 * Get the list of users
 * @returns list of users
 */
export async function getUsers(): Promise<InstanceType<typeof db.Tables.User>[]> {
  return db.Tables.User.findAll();
}

/**
 * Get an user by its username 
 * @param username username of the user
 * @returns the user we're looking 
 */
export async function getUserByUsername(username: string): Promise<InstanceType<typeof db.Tables.User> | null> {
  return db.Tables.User.findOne({ where: { username } });
}

/**
 * Create an user 
 * @param username username of the user
 * @param email email of the user
 * @param role role of the user
 * @returns the user created
 */
export async function createUser(username: string, email: string, role: string): Promise<InstanceType<typeof db.Tables.User> | null> {
  return db.Tables.User.create({ username, email, role });
}

/**
 * Delete a user 
 * @param user_id the id of the user to delete
 * @returns the number of user row deleted (normally 1) 
 */
export async function deleteUser(user_id: number): Promise<number>  {
  return db.Tables.User.destroy({ where : { user_id }});
}