import { db } from "@/lib/db";
import { CompleteGamePermission } from "@/lib/views/gamesView.queries";
import { NotFoundError } from "@/lib/errors/notFoundError";
/**
 * Get games
 * @returns all games
 */
export async function getGames(): Promise<InstanceType<typeof db.Tables.Game>[]> {
   return db.Tables.Game.findAll();
}

/**
 * Get game by its game_id
 * @param game_id game identifier
 * @returns specified game
 */
export async function getGameById(game_id : number): Promise<InstanceType<typeof db.Tables.Game> | null> {
    const result = await db.Tables.Game.findByPk(game_id);
    return result;
}

/**
 * Get games for a specific user_id
 * @param user_id user identifier
 * @returns all games for the specified user
 */
export async function getGamesByUser(user_id : number): Promise<CompleteGamePermission[]> {
    const results = await db.Functions.runViewQuery(
      db.Views.Games.byUser,
      { user_id }
    );
    return results as CompleteGamePermission[];
}

/**
 * Create a game
 * @param name game name
 * @param isPublic public or private game
 * @param description game description
 * @param type game type
 * @param owner_id game owner id
 * @param technology_id game technology id
 * @param tracker_id game tracker id
 * @returns the game created
 */
export async function createGame(name: string, isPublic : boolean, description : string, type: string, owner_id : number, technology_id : number, tracker_id : number): Promise<InstanceType<typeof db.Tables.Game>> {
  return db.Tables.Game.create({ name, public: isPublic, description, type, owner_id, technology_id, tracker_id });
}

/**
 * Update BULK games
 * @param where options to select games to update
 * @param payload partial game to updates
 * @returns the number of updated games
 */
export async function updateGames(where: Partial<InstanceType<typeof db.Tables.Game>>, payload : Partial<InstanceType<typeof db.Tables.Game>>): Promise<number> {
  const [affectedRows] = await db.Tables.Game.update(payload, { where : where });
  return affectedRows;
}

/**
 * Update ONE game
 * @param gameId game identifier
 * @param payload partial game to update
 * @returns the updated game 
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
 * Delete game
 * @param gameId game identifier to delete
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
 * Delete games
 * @param where options to select games to delete
 * @returns the number of games row deleted
 */
export async function deleteGames(where: Partial<InstanceType<typeof db.Tables.Game>>): Promise<number> {
  return db.Tables.Game.destroy({ where });
}