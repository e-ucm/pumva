import { Request, Response, NextFunction } from "express";
import * as gameVersionsService from "@/services/gameVersions.service";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all game versions from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /game-versions
 * // Returns all game versions
 */
export async function getGameVersions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameVersions = await gameVersionsService.getGameVersions();
    res.json(gameVersions);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single game version by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game version ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /game-versions/1
 * // Returns game version with ID 1
 */
export async function getGameVersionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameVersion = await gameVersionsService.getGameVersionById(Number(req.params.id));
    if (!gameVersion) {
      throw new NotFoundError("Game version not found");
    }
    res.json(gameVersion);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new game version.
 * 
 * @async
 * @param {Request} req - Express request object containing game version data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // POST /game-versions
 * // Body: { game_id: 1, version: "1.0.0", executable: "game.exe" }
 * // Returns: Created game version with 201 status
 */
export async function createGameVersion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameVersion = await gameVersionsService.createGameVersion(req.body);
    res.status(201).json(gameVersion);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing game version by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game version ID in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /game-versions/1
 * // Body: { version: "1.0.1" }
 * // Returns: Updated game version
 */
export async function updateGameVersionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameVersion = await gameVersionsService.updateGameVersionById(Number(req.params.id), req.body);
    res.json(gameVersion);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a game version by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game version ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /game-versions/1
 * // Returns: 204 No Content
 */
export async function deleteGameVersionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await gameVersionsService.deleteGameVersionById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}