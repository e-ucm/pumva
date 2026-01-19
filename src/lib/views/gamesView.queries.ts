/**
 * Represents a complete game permission record from the database view.
 * Contains aggregated data from games, permissions, users, technologies, and trackers.
 * 
 * @class CompleteGamePermission
 * 
 * @property {number} user_id - ID of the user with permission
 * @property {string} username - Username of the user
 * @property {string} role - Role of the user
 * @property {string} email - Email of the user
 * @property {string} permission - Permission type (READ, WRITE)
 * @property {number} game_id - ID of the game
 * @property {string} name - Name of the game
 * @property {boolean} public - Whether the game is public
 * @property {string} description - Game description
 * @property {number} owner_id - ID of the game owner
 * @property {string} type - Game type (WEB, DESKTOP)
 * @property {number} actual_version_id - ID of the current version
 * @property {string} actual_version_url - URL of the current version
 * @property {string} technology_name - Name of the technology used
 * @property {string} tracker_name - Name of the tracker used
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Record update timestamp
 */
export class CompleteGamePermission {
  declare user_id: number;
  declare username: string;
  declare role: string;
  declare email: string;
  declare permission: string;
  declare game_id: number;
  declare name: string;
  declare public: boolean;
  declare description: string;
  declare owner_id: number;
  declare type: string;
  declare actual_version_id: number;
  declare actual_version_url: string;
  declare technology_name: string;
  declare tracker_name: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Returns a collection of predefined database view queries for games.
 * 
 * @function GamesViews
 * @returns {Object} Object containing named query templates:
 *   - byUser: Query games for a specific user with their permissions
 *   - publicGames: Query all publicly available games
 * 
 * @example
 * ```typescript
 * const views = GamesViews();
 * const result = await db.Functions.runViewQuery(
 *   views.byUser,
 *   { user_id: 123 }
 * );
 * ```
 */
export function GamesViews() {
  return {
    byUser: {
      description: "List games and games permissions for a specific user",
      sql: `
        SELECT *
        FROM v_complete_game_permissions
        WHERE user_id = :user_id
      `,
      params: {
        user_id: {
          type: "number",
          required: true,
          description: "User id",
          example: 235,
        },
      },
    },
    publicGames: {
      description: "List all public games",
      sql: `
        SELECT *
        FROM v_public_games_permissions
      `,
      params: {},
    },
  }
};
