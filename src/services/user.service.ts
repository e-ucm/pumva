import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Get the list of users
 * @returns list of users
 */
export async function getUsers(): Promise<InstanceType<typeof db.Tables.User>[]> {
  return db.Tables.User.findAll();
}

/**
 * Get user by its user_id
 * @param user_id user identifier
 * @returns specified user
 */
export async function getUserById(user_id : number): Promise<InstanceType<typeof db.Tables.User> | null> {
    const result = await db.Tables.User.findByPk(user_id);
    return result;
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
 * @param user partial of a user
 * @returns the user created
 */
export async function createUser(user : Partial<InstanceType<typeof db.Tables.User>>): Promise<InstanceType<typeof db.Tables.User> | null> {
  return db.Tables.User.create(user);
}


/**
 * Update BULK users
 * @param where options to select users to update
 * @param payload partial user to updates
 * @returns the number of updated users
 */
export async function updateUsers(where: Partial<InstanceType<typeof db.Tables.User>>, payload : Partial<InstanceType<typeof db.Tables.User>>): Promise<number> {
  const [affectedRows] = await db.Tables.User.update(payload, { where : where });
  return affectedRows;
}

/**
 * Update ONE user
 * @param userId user identifier
 * @param payload partial user to update
 * @returns the updated user 
 */
export async function updateUserById(userId: number, payload: Partial<InstanceType<typeof db.Tables.User>>): Promise<InstanceType<typeof db.Tables.User>> {
  return db.sequelize.transaction(async (t) => {
    const user = await db.Tables.User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await user.update(payload, { transaction: t });
    return user;
  });
}

/**
 * Delete user
 * @param userId user identifier to delete
 */
export async function deleteUserById(userId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const user = await db.Tables.User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await user.destroy({ transaction: t });
  });
}

/**
 * Delete users
 * @param where options to select users to delete
 * @returns the number of users row deleted
 */
export async function deleteUsers(where: Partial<InstanceType<typeof db.Tables.User>>): Promise<number> {
  return db.Tables.User.destroy({ where });
}