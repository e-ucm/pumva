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
