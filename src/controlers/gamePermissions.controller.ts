import { Request, Response, NextFunction } from "express";
import * as gamePermissionsService from "@/services/gamePermissions.service";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Retrieves all game permissions from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /game-permissions
 * // Returns all game permissions
 */
export async function getGamePermissions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gamePermissions = await gamePermissionsService.getGamePermissions();
    res.json(gamePermissions);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single game permission by composite key (user_id, game_id).
 * 
 * @async
 * @param {Request} req - Express request object containing userId and gameId in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /game-permissions/1/2
 * // Returns game permission for user_id=1 and game_id=2
 */
export async function getGamePermissionByKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.params.userId);
    const gameId = Number(req.params.gameId);
    const gamePermission = await gamePermissionsService.getGamePermissionById(gameId, userId);
    if (!gamePermission) {
      throw new NotFoundError("Game permission not found");
    }
    res.json(gamePermission);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new game permission.
 * 
 * @async
 * @param {Request} req - Express request object containing game permission data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // POST /game-permissions
 * // Body: { user_id: 1, game_id: 2, permission: "READ" }
 * // Returns: Created game permission with 201 status
 */
export async function createGamePermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gamePermission = await gamePermissionsService.createGamePermission(req.body);
    res.status(201).json(gamePermission);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing game permission by composite key (user_id, game_id).
 * 
 * @async
 * @param {Request} req - Express request object containing userId and gameId in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /game-permissions/1/2
 * // Body: { permission: "WRITE" }
 * // Returns: Updated game permission
 */
export async function updateGamePermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.params.userId);
    const gameId = Number(req.params.gameId);
    const gamePermission = await gamePermissionsService.updateGamePermissionById(gameId, userId, req.body);
    res.json(gamePermission);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a game permission by composite key (user_id, game_id).
 * 
 * @async
 * @param {Request} req - Express request object containing userId and gameId in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /game-permissions/1/2
 * // Returns: 204 No Content
 */
export async function deleteGamePermissionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.params.userId);
    const gameId = Number(req.params.gameId);
    await gamePermissionsService.deleteGamePermissionById(userId, gameId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}