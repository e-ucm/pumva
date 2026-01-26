import { Sequelize } from "sequelize";
import { GamesViews } from "@/lib/views/gamesView.queries";
import { UsersViews } from "@/lib/views/usersView.queries";
import { GuideGamesViews } from "@/lib/views/guideGamesView.queries";

/**
 * Initializes all database view queries for the application.
 *
 * Aggregates all view query templates and makes them available through a single object.
 * Views are used for running complex SELECT queries against database views.
 *
 * @function initViews
 * @param {Sequelize} sequelize - The Sequelize database instance (currently unused but available for future use)
 * @returns {Object} An object containing all view query sets:
 *   - Games: Game-related view queries
 *   - GuideGames: Game guide-related view queries
 *   - Users: User-related view queries
 *
 * @example
 * ```typescript
 * const views = initViews(sequelize);
 * const games = await db.Functions.runViewQuery(
 *   views.Games.byUser,
 *   { user_id: 123 }
 * );
 * ```
 */
export default function initViews(sequelize: Sequelize) {
  return {
    Games: GamesViews(),
    GuideGames: GuideGamesViews(),
    Users: UsersViews(),
  };
}