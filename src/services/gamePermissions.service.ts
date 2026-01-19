import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Retrieves all game permissions from the database.
 * 
 * @async
 * @function getGamePermissions
 * @returns {Promise<Array>} Array of all game permission records
 * 
 * @example
 * ```typescript
 * const permissions = await getGamePermissions();
 * ```
 */
export async function getGamePermissions(): Promise<InstanceType<typeof db.Tables.GamePermissions>[]> {
  return db.Tables.GamePermissions.findAll();
}

/**
 * Retrieves a single game permission by its composite primary key (game_id, user_id).
 * 
 * @async
 * @function getGamePermissionById
 * @param {number} game_id - The game identifier
 * @param {number} user_id - The user identifier
 * @returns {Promise<Object|null>} The game permission record or null if not found
 * 
 * @example
 * ```typescript
 * const permission = await getGamePermissionById(1, 5);
 * ```
 */
export async function getGamePermissionById(
  game_id: number,
  user_id: number
): Promise<InstanceType<typeof db.Tables.GamePermissions> | null> {
  return db.Tables.GamePermissions.findOne({
    where: { game_id, user_id }
  });
}

/**
 * Creates a new game permission in the database.
 * 
 * @async
 * @function createGamePermission
 * @param {Object} gamePermission - Game permission data (game_id, user_id, permission required)
 * @returns {Promise<Object>} The created game permission record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const permission = await createGamePermission({ game_id: 1, user_id: 5, permission: 'READ' });
 * ```
 */
export async function createGamePermission(
  gamePermission: Partial<InstanceType<typeof db.Tables.GamePermissions>>
): Promise<InstanceType<typeof db.Tables.GamePermissions>> {
  return db.Tables.GamePermissions.create(gamePermission);
}

/**
 * Updates multiple game permissions matching a condition.
 * 
 * @async
 * @function updateGamePermissions
 * @param {Object} where - Condition to find game permissions to update
 * @param {Object} payload - Partial game permission data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateGamePermissions({ game_id: 1 }, { permission: 'WRITE' });
 * ```
 */
export async function updateGamePermissions(
  where: Partial<InstanceType<typeof db.Tables.GamePermissions>>,
  payload: Partial<InstanceType<typeof db.Tables.GamePermissions>>
): Promise<number> {
  const [affectedRows] = await db.Tables.GamePermissions.update(payload, { where });
  return affectedRows;
}

/**
 * Updates a single game permission by its composite key within a transaction.
 * 
 * @async
 * @function updateGamePermissionById
 * @param {number} game_id - The game identifier
 * @param {number} user_id - The user identifier
 * @param {Object} payload - Partial game permission data to update
 * @returns {Promise<Object>} The updated game permission record
 * 
 * @throws {NotFoundError} If game permission with given keys does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateGamePermissionById(1, 5, { permission: 'ADMIN' });
 * ```
 */
export async function updateGamePermissionById(
  game_id: number,
  user_id: number,
  payload: Partial<InstanceType<typeof db.Tables.GamePermissions>>
): Promise<InstanceType<typeof db.Tables.GamePermissions>> {
  return db.sequelize.transaction(async (t) => {
    const gamePermission = await db.Tables.GamePermissions.findOne({
      where: { game_id, user_id },
      transaction: t
    });
    if (!gamePermission) {
      throw new NotFoundError("Game permission not found");
    }
    await gamePermission.update(payload, { transaction: t });
    return gamePermission;
  });
}

/**
 * Deletes a single game permission by its composite key within a transaction.
 * 
 * @async
 * @function deleteGamePermissionById
 * @param {number} game_id - The game identifier
 * @param {number} user_id - The user identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If game permission with given keys does not exist
 * 
 * @example
 * ```typescript
 * await deleteGamePermissionById(1, 5);
 * ```
 */
export async function deleteGamePermissionById(
  game_id: number,
  user_id: number
): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const gamePermission = await db.Tables.GamePermissions.findOne({
      where: { game_id, user_id },
      transaction: t
    });
    if (!gamePermission) {
      throw new NotFoundError("Game permission not found");
    }
    await gamePermission.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple game permissions matching a condition.
 * 
 * @async
 * @function deleteGamePermissions
 * @param {Object} where - Condition to find game permissions to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteGamePermissions({ game_id: 1 });
 * ```
 */
export async function deleteGamePermissions(
  where: Partial<InstanceType<typeof db.Tables.GamePermissions>>
): Promise<number> {
  return db.Tables.GamePermissions.destroy({ where });
}
