export function GamesViews() {
  return {
    byUser: {
      description: "List games and games permissions for a specific user",
      sql: `
        SELECT *
        FROM v_public_games_permissions
        WHERE user_id = :user_id
      `,
      params: {
        user_id: {
          type: "string",
          required: true,
          description: "User id",
          example: "235",
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
