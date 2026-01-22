import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all games from the database.
 * 
 * @async
 * @function getGames
 * @returns {Promise<Array>} Array of all game records
 * 
 * @example
 * ```typescript
 * const games = await getGames();
 * ```
 */
export async function getGames(): Promise<InstanceType<typeof db.Tables.Game>[]> {
   return db.Tables.Game.findAll();
}

/**
 * Retrieves a single game by its ID.
 * 
 * @async
 * @function getGameById
 * @param {number} game_id - The game identifier
 * @returns {Promise<Object>} The game record
 * @throws {NotFoundError} If game with given ID does not exist
 * 
 * @example
 * ```typescript
 * const game = await getGameById(123);
 * ```
 */
export async function getGameById(game_id : number): Promise<InstanceType<typeof db.Tables.Game>> {
    const result = await db.Tables.Game.findByPk(game_id);
    if (!result) {
      throw new NotFoundError("Game not found");
    }
    return result;
}

/**
 * Creates a new game in the database.
 * 
 * @async
 * @function createGame
 * @param {Partial<InstanceType<typeof db.Tables.Game>>} game - Partial game data
 * @returns {Promise<InstanceType<typeof db.Tables.Game>>} The created game record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const game = await createGame({ name: 'My Game', isPublic: true, description: 'A fun game', type: 'WEB', owner_id: 1, technology_id: 2, tracker_id: 3 });
 * ```
 */
export async function createGame(game : Partial<InstanceType<typeof db.Tables.Game>>): Promise<InstanceType<typeof db.Tables.Game>> {
  return db.Tables.Game.create(game);
}

/**
 * Updates multiple games matching a condition.
 * 
 * @async
 * @function updateGames
 * @param {Object} where - Condition to find games to update
 * @param {Object} payload - Partial game data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateGames({ type: 'WEB' }, { public: true });
 * ```
 */
export async function updateGames(where: Partial<InstanceType<typeof db.Tables.Game>>, payload : Partial<InstanceType<typeof db.Tables.Game>>): Promise<number> {
  const [affectedRows] = await db.Tables.Game.update(payload, { where : where });
  return affectedRows;
}

/**
 * Updates a single game by ID within a transaction.
 * 
 * @async
 * @function updateGame
 * @param {number} gameId - The game identifier
 * @param {Object} payload - Partial game data to update
 * @returns {Promise<InstanceType<typeof db.Tables.Game>>} The updated game record
 * 
 * @throws {NotFoundError} If game with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateGame(123, { name: 'New Name' });
 * ```
 */
export async function updateGame(gameId: number, payload: Partial<InstanceType<typeof db.Tables.Game>>): Promise<InstanceType<typeof db.Tables.Game>> {
  return db.sequelize.transaction(async (t) => {
    const game = await db.Tables.Game.findByPk(gameId, { transaction: t });
    if (!game) {
      throw new NotFoundError("Game not found");
    }
    await game.update(payload, { transaction: t });
    return game;
  });
}

/**
 * Deletes a single game by ID within a transaction.
 * 
 * @async
 * @function deleteGameById
 * @param {number} gameId - The game identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If game with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteGameById(123);
 * ```
 */
export async function deleteGameById(gameId: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const game = await db.Tables.Game.findByPk(gameId, { transaction: t });
    if (!game) {
      throw new NotFoundError("Game not found");
    }
    await game.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple games matching a condition.
 * 
 * @async
 * @function deleteGames
 * @param {Partial<InstanceType<typeof db.Tables.Game>>} where - Condition to find games to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteGames({ owner_id: 1 });
 * ```
 */
export async function deleteGames(where: Partial<InstanceType<typeof db.Tables.Game>>): Promise<number> {
  return db.Tables.Game.destroy({ where });
}

/**
 * Sets a specific game version as the actual (current) version for a game.
 * 
 * @async
 * @function setGameVersionAsActual
 * @param {number} gameId - The game identifier
 * @param {number} versionId - The version identifier to set as actual
 * @returns {Promise<Object>} The updated game record
 * 
 * @throws {NotFoundError} If game or version with given IDs do not exist
 * 
 * @example
 * ```typescript
 * const updatedGame = await setGameVersionAsActual(123, 456);
 * ```
 */
export async function setGameVersionAsActual(gameId: number, versionId: number): Promise<InstanceType<typeof db.Tables.Game>> {
  return db.sequelize.transaction(async (t) => {
    // Check if game exists
    const game = await db.Tables.Game.findByPk(gameId, { transaction: t });
    if (!game) {
      throw new NotFoundError("Game not found");
    }

    // Check if version exists and belongs to the game
    const gameVersion = await db.Tables.GamesVersions.findOne({
      where: { version_id: versionId, game_id: gameId },
      transaction: t
    });
    if (!gameVersion) {
      throw new NotFoundError("Game version not found or does not belong to this game");
    }

    // Update the game's actual field to the version ID
    await game.update({ actual: versionId }, { transaction: t });
    return game;
  });
}