/**
 * Represents a complete game guide permission record from the database view.
 * Contains aggregated data from games, guides, languages, and permissions.
 * 
 * @class CompleteGameGuidePermission
 * 
 * @property {number} user_id - ID of the user with permission
 * @property {string} username - Username of the user
 * @property {string} role - Role of the user
 * @property {string} email - Email of the user
 * @property {string} permission - Permission type (READ, WRITE)
 * @property {number} game_id - ID of the game
 * @property {string} language - Language of the teacher guide
 * @property {boolean} teacher_guide_url - URL of the teacher guide
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Record update timestamp
 */
export class CompleteGameGuidePermission {
  declare user_id: number;
  declare username: string;
  declare role: string;
  declare email: string;
  declare permission: string;
  declare game_id: number;
  declare language: string;
  declare teacher_guide_url: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Returns a collection of predefined database view queries for game guides.
 * 
 * @function GuideGamesViews
 * @returns {Object} Object containing named query templates:
 *   - byUser: Query guide permissions for a specific user and game combination
 * 
 * @example
 * ```typescript
 * const views = GuideGamesViews();
 * const result = await db.Functions.runViewQuery(
 *   views.byUser,
 *   { user_id: 123, game_id: 456 }
 * );
 * ```
 */
export function GuideGamesViews() {
  return {
    byUser: {
      description: "List guide games, languages and games permissions for a specific user and game",
      sql: `
        SELECT *
        FROM v_game_guide_url_permissions
        WHERE user_id = :user_id AND game_id = :game_id
      `,
      params: {
        user_id: {
          type: "number",
          required: true,
          description: "User id",
          example: "235",
        },
        game_id: {
          type: "number",
          required: true,
          description: "Game id",
          example: "123",
        },
     },
    },
  }
};
