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
