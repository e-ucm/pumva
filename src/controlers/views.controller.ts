import { Request, Response } from "express";
import { 
  getGamesByUser, 
  getPublicGames, 
  getTeacherGuidesByUserAndGame, 
  getUserByUsername 
} from "@/services/views.service";
import { BadRequestError, NotFoundError } from "@/lib/errors/appErrors";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

/**
 * Controller for view-based endpoints.
 * Handles requests for database view queries that aggregate data from multiple tables.
 * 
 * View endpoints follow the pattern: /views/<viewname>/<params>
 */

/**
 * Get games for a specific user with permissions.
 * Endpoint: GET /views/games/user/:user_id
 * 
 * @async
 * @function getGamesByUserController
 * @param {AuthenticatedRequest} req - Express request object with auth data
 * @param {Response} res - Express response object
 * 
 * @example
 * ```typescript
 * GET /views/games/user/123
 * Response: [{ user_id: 123, game_id: 1, permission: 'READ', ... }]
 * ```
 */
export async function getGamesByUserController(req: AuthenticatedRequest, res: Response) {
  const user_id = parseInt(req.params.user_id);
  
  if (isNaN(user_id)) {
    throw new BadRequestError("Invalid user_id parameter");
  }

  const games = await getGamesByUser(user_id);
  res.json(games);
}

/**
 * Get all public games.
 * Endpoint: GET /views/games/public
 * 
 * @async
 * @function getPublicGamesController
 * @param {AuthenticatedRequest} req - Express request object with auth data
 * @param {Response} res - Express response object
 * 
 * @example
 * ```typescript
 * GET /views/games/public
 * Response: [{ game_id: 1, name: 'Public Game', public: true, ... }]
 * ```
 */
export async function getPublicGamesController(req: AuthenticatedRequest, res: Response) {
  const games = await getPublicGames();
  res.json(games);
}

/**
 * Get teacher guides for a specific user and game.
 * Endpoint: GET /views/guides/user/:user_id/game/:game_id
 * 
 * @async
 * @function getTeacherGuidesByUserAndGameController
 * @param {AuthenticatedRequest} req - Express request object with auth data
 * @param {Response} res - Express response object
 * 
 * @example
 * ```typescript
 * GET /views/guides/user/123/game/456
 * Response: [{ user_id: 123, game_id: 456, language: 'en', teacher_guide_url: '...', ... }]
 * ```
 */
export async function getTeacherGuidesByUserAndGameController(req: AuthenticatedRequest, res: Response) {
  const user_id = parseInt(req.params.user_id);
  const game_id = parseInt(req.params.game_id);
  
  if (isNaN(user_id)) {
    throw new BadRequestError("Invalid user_id parameter");
  }
  
  if (isNaN(game_id)) {
    throw new BadRequestError("Invalid game_id parameter");
  }

  const guides = await getTeacherGuidesByUserAndGame(user_id, game_id);
  res.json(guides);
}

/**
 * Get user by username.
 * Endpoint: GET /views/users/username/:username
 * 
 * @async
 * @function getUserByUsernameController
 * @param {AuthenticatedRequest} req - Express request object with auth data
 * @param {Response} res - Express response object
 * 
 * @example
 * ```typescript
 * GET /views/users/username/john_doe
 * Response: [{ user_id: 123, username: 'john_doe', email: '...', ... }]
 * ```
 */
export async function getUserByUsernameController(req: AuthenticatedRequest, res: Response) {
  const { username } = req.params;
  
  if (!username || username.trim() === '') {
    throw new BadRequestError("Username parameter is required");
  }

  const users = await getUserByUsername(username);
  
  if (users.length === 0) {
    throw new NotFoundError("User not found");
  }
  
  res.json(users);
}