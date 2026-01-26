import { db } from "@/lib/db";
import { CompleteGamePermission } from "@/lib/views/gamesView.queries";
import { CompleteGameGuidePermission } from "@/lib/views/guideGamesView.queries";

/**
 * Service for handling database view operations.
 * Provides methods to execute view queries for different data aggregations.
 * 
 * This service is separate from table services to clearly separate
 * view queries (read-only complex data aggregations) from table operations
 * (CRUD operations on individual tables).
 */

/**
 * Retrieves games with user permissions for a specific user.
 * Uses the v_complete_game_permissions view to get aggregated data.
 * 
 * @async
 * @function getGamesByUser
 * @param {number} user_id - The user identifier
 * @returns {Promise<CompleteGamePermission[]>} Array of game records with permission information
 * 
 * @example
 * ```typescript
 * const userGames = await getGamesByUser(456);
 * ```
 */
export async function getGamesByUser(user_id: number): Promise<CompleteGamePermission[]> {
  const results = await db.Functions.runViewQuery(
    db.Views.Games.byUser,
    
    { user_id }
  );
  return results as CompleteGamePermission[];
}

/**
 * Retrieves all public games.
 * Uses the v_public_games_permissions view to get public game data.
 * 
 * @async
 * @function getPublicGames
 * @returns {Promise<CompleteGamePermission[]>} Array of public game records
 * 
 * @example
 * ```typescript
 * const publicGames = await getPublicGames();
 * ```
 */
export async function getPublicGames(): Promise<CompleteGamePermission[]> {
  const results = await db.Functions.runViewQuery(
    db.Views.Games.publicGames,
    {}
  );
  return results as CompleteGamePermission[];
}

/**
 * Retrieves teacher guides with user permissions for a specific user and game.
 * Uses the v_game_guide_url_permissions view to get aggregated data.
 * 
 * @async
 * @function getTeacherGuidesByUserAndGame
 * @param {number} user_id - The user identifier
 * @param {number} game_id - The game identifier
 * @returns {Promise<CompleteGameGuidePermission[]>} Array of teacher guide records with permission information
 * 
 * @example
 * ```typescript
 * const guides = await getTeacherGuidesByUserAndGame(123, 456);
 * ```
 */
export async function getTeacherGuidesByUserAndGame(
  user_id: number, 
  game_id: number
): Promise<CompleteGameGuidePermission[]> {
  const results = await db.Functions.runViewQuery(
    db.Views.GuideGames.byUser,
    { user_id, game_id }
  );
  return results as CompleteGameGuidePermission[];
}

/**
 * Retrieves user information by username.
 * Uses the Users table to find user by username.
 * 
 * @async
 * @function getUserByUsername
 * @param {string} username - The username to search for
 * @returns {Promise<any[]>} Array with user record or empty array if not found
 * 
 * @example
 * ```typescript
 * const user = await getUserByUsername('john_doe');
 * ```
 */
export async function getUserByUsername(username: string): Promise<any[]> {
  const results = await db.Functions.runViewQuery(
    db.Views.Users.byUsername,
    { username }
  );
  return results;
}