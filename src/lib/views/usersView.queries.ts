/**
 * Returns a collection of predefined database view queries for users.
 * 
 * @function UsersViews
 * @returns {Object} Object containing named query templates:
 *   - byUsername: Query a user by their username
 * 
 * @example
 * ```typescript
 * const views = UsersViews();
 * const result = await db.Functions.runViewQuery(
 *   views.byUsername,
 *   { username: 'john_doe' }
 * );
 * ```
 */
export function UsersViews() {
  return {
    byUsername: {
      description: "Get user by username",
      sql: `
        SELECT *
        FROM Users
        WHERE username = :username
      `,
      params: {
        username: {
          type: "string",
          required: true,
          description: "Username",
          example: "user",
        },
      },
    }
  }
};
