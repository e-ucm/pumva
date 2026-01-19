import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Retrieves all users from the database.
 * 
 * @async
 * @function getUsers
 * @returns {Promise<Array>} Array of all user records
 * 
 * @example
 * ```typescript
 * const users = await getUsers();
 * ```
 */
export async function getUsers(): Promise<InstanceType<typeof db.Tables.User>[]> {
  return db.Tables.User.findAll();
}

/**
 * Retrieves a single user by their ID.
 * 
 * @async
 * @function getUserById
 * @param {number} user_id - The user identifier
 * @returns {Promise<Object|null>} The user record or null if not found
 * 
 * @example
 * ```typescript
 * const user = await getUserById(123);
 * ```
 */
export async function getUserById(user_id : number): Promise<InstanceType<typeof db.Tables.User> | null> {
    const result = await db.Tables.User.findByPk(user_id);
    return result;
}

/**
 * Retrieves a user by their username.
 * 
 * @async
 * @function getUserByUsername
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} The user record or null if not found
 * 
 * @example
 * ```typescript
 * const user = await getUserByUsername('john_doe');
 * ```
 */
export async function getUserByUsername(username: string): Promise<InstanceType<typeof db.Tables.User> | null> {
  return db.Tables.User.findOne({ where: { username } });
}

/**
 * Creates a new user in the database.
 * 
 * @async
 * @function createUser
 * @param {Object} user - Partial user data (username, email, role required)
 * @returns {Promise<Object|null>} The created user record or null on failure
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const user = await createUser({ username: 'john', email: 'john@example.com', role: 'student' });
 * ```
 */
export async function createUser(user : Partial<InstanceType<typeof db.Tables.User>>): Promise<InstanceType<typeof db.Tables.User> | null> {
  return db.Tables.User.create(user);
}


/**
 * Updates multiple users matching a condition.
 * 
 * @async
 * @function updateUsers
 * @param {Object} where - Condition to find users to update
 * @param {Object} payload - Partial user data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateUsers({ role: 'student' }, { role: 'teacher' });
 * ```
 */
export async function updateUsers(where: Partial<InstanceType<typeof db.Tables.User>>, payload : Partial<InstanceType<typeof db.Tables.User>>): Promise<number> {
  const [affectedRows] = await db.Tables.User.update(payload, { where : where });
  return affectedRows;
}

/**
 * Updates a single user by ID within a transaction.
 * 
 * @async
 * @function updateUserById
 * @param {number} userId - The user identifier
 * @param {Object} payload - Partial user data to update
 * @returns {Promise<Object>} The updated user record
 * 
 * @throws {NotFoundError} If user with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateUserById(123, { email: 'newemail@example.com' });
 * ```
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
 * Deletes a single user by ID within a transaction.
 * 
 * @async
 * @function deleteUserById
 * @param {number} userId - The user identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If user with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteUserById(123);
 * ```
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
 * Deletes multiple users matching a condition.
 * 
 * @async
 * @function deleteUsers
 * @param {Object} where - Condition to find users to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteUsers({ role: 'guest' });
 * ```
 */
export async function deleteUsers(where: Partial<InstanceType<typeof db.Tables.User>>): Promise<number> {
  return db.Tables.User.destroy({ where });
}