import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all game versions from the database.
 * 
 * @async
 * @function getGameVersions
 * @returns {Promise<Array>} Array of all game version records
 * 
 * @example
 * ```typescript
 * const versions = await getGameVersions();
 * ```
 */
export async function getGameVersions(): Promise<InstanceType<typeof db.Tables.GamesVersions>[]> {
  return db.Tables.GamesVersions.findAll();
}

/**
 * Retrieves a single game version by its version_id.
 * 
 * @async
 * @function getGameVersionById
 * @param {number} version_id - The version identifier
 * @returns {Promise<InstanceType<typeof db.Tables.GamesVersions>>} The game version record
 * @throws {NotFoundError} If game version with given ID does not exist
 * 
 * @example
 * ```typescript
 * const version = await getGameVersionById(10);
 * ```
 */
export async function getGameVersionById(
  version_id: number
): Promise<InstanceType<typeof db.Tables.GamesVersions>> {
  const result = await db.Tables.GamesVersions.findByPk(version_id);
  if (!result) {
    throw new NotFoundError("Game version not found");
  }
  return result;
}

/**
 * Creates a new game version in the database.
 * 
 * @async
 * @function createGameVersion
 * @param {Partial<InstanceType<typeof db.Tables.GamesVersions>>} gameVersion - Game version data (game_id, version, external_url required)
 * @returns {Promise<InstanceType<typeof db.Tables.GamesVersions>>} The created game version record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const version = await createGameVersion({ 
 *   game_id: 1, 
 *   version: '1.0.0', 
 *   external_url: 'https://example.com/game/v1' 
 * });
 * ```
 */
export async function createGameVersion(
  gameVersion: Partial<InstanceType<typeof db.Tables.GamesVersions>>
): Promise<InstanceType<typeof db.Tables.GamesVersions>> {
  return db.Tables.GamesVersions.create(gameVersion);
}

/**
 * Updates multiple game versions matching a condition.
 * 
 * @async
 * @function updateGameVersions
 * @param {Partial<InstanceType<typeof db.Tables.GamesVersions>>} where - Condition to find game versions to update
 * @param {Partial<InstanceType<typeof db.Tables.GamesVersions>>} payload - Partial game version data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateGameVersions({ game_id: 1 }, { external_url: 'https://new-url.com' });
 * ```
 */
export async function updateGameVersions(
  where: Partial<InstanceType<typeof db.Tables.GamesVersions>>,
  payload: Partial<InstanceType<typeof db.Tables.GamesVersions>>
): Promise<number> {
  const [affectedRows] = await db.Tables.GamesVersions.update(payload, { where });
  return affectedRows;
}

/**
 * Updates a single game version by version_id within a transaction.
 * 
 * @async
 * @function updateGameVersionById
 * @param {number} version_id - The version identifier
 * @param {Partial<InstanceType<typeof db.Tables.GamesVersions>>} payload - Partial game version data to update
 * @returns {Promise<InstanceType<typeof db.Tables.GamesVersions>>} The updated game version record
 * 
 * @throws {NotFoundError} If game version with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateGameVersionById(10, { version: '1.0.1' });
 * ```
 */
export async function updateGameVersionById(
  version_id: number,
  payload: Partial<InstanceType<typeof db.Tables.GamesVersions>>
): Promise<InstanceType<typeof db.Tables.GamesVersions>> {
  return db.sequelize.transaction(async (t) => {
    const gameVersion = await db.Tables.GamesVersions.findByPk(version_id, { transaction: t });
    if (!gameVersion) {
      throw new NotFoundError("Game version not found");
    }
    await gameVersion.update(payload, { transaction: t });
    return gameVersion;
  });
}

/**
 * Deletes a single game version by version_id within a transaction.
 * 
 * @async
 * @function deleteGameVersionById
 * @param {number} version_id - The version identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If game version with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteGameVersionById(10);
 * ```
 */
export async function deleteGameVersionById(version_id: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const gameVersion = await db.Tables.GamesVersions.findByPk(version_id, { transaction: t });
    if (!gameVersion) {
      throw new NotFoundError("Game version not found");
    }
    await gameVersion.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple game versions matching a condition.
 * 
 * @async
 * @function deleteGameVersions
 * @param {Partial<InstanceType<typeof db.Tables.GamesVersions>>} where - Condition to find game versions to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteGameVersions({ game_id: 1 });
 * ```
 */
export async function deleteGameVersions(
  where: Partial<InstanceType<typeof db.Tables.GamesVersions>>
): Promise<number> {
  return db.Tables.GamesVersions.destroy({ where });
}
