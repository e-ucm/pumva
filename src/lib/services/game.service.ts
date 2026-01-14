import { db } from "@/lib/db";
/**
 * Get games
 * @returns all games
 */
export async function getGames(): Promise<InstanceType<typeof db.Tables.Game>[]> {
   return db.Tables.Game.findAll();
}

/**
 * Get games for a specific user_id
 * @param user_id user identifier
 * @returns all games for the specified user
 */
export async function getGamesByUser(user_id : number): Promise<any[]> {
     const results = await db.Functions.runViewQuery(
      db.Views.Games.byUser,
      { user_id }
    );
    return results;
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
 * Delete a game
 * @param game_id the id of the game to delete
 * @returns the number of game row deleted (normally 1) 
 */
export async function deleteGame(game_id: number): Promise<number> {
  return db.Tables.Game.destroy({ where : { game_id }});
}