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
          type: "string",
          required: true,
          description: "User id",
          example: "235",
        },
        game_id: {
          type: "string",
          required: true,
          description: "Game id",
          example: "123",
        },
     },
    },
  }
};
