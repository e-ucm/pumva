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
