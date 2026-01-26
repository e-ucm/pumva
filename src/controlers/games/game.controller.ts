import { Request, Response, NextFunction } from "express";
import * as gameService from "@/services/games/game.service";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all games from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /games
 * // Returns all games
 */
export async function getGames(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const games = await gameService.getGames();
    res.json(games);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single game by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /games/1
 * // Returns game with ID 1
 */
export async function getGameById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const game = await gameService.getGameById(Number(req.params.id));
    if (!game) {
      throw new NotFoundError("Game not found");
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new game.
 * 
 * @async
 * @param {Request} req - Express request object containing game data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // POST /games
 * // Body: { name: "My Game", public: true, technology_id: 1, owner_id: 1 }
 * // Returns: Created game with 201 status
 */
export async function createGame(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const game = await gameService.createGame(req.body);
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing game by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game ID in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /games/1
 * // Body: { name: "Updated Game Name" }
 * // Returns: Updated game
 */
export async function updateGameById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const game = await gameService.updateGame(Number(req.params.id), req.body);
    res.json(game);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a game by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing game ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /games/1
 * // Returns: 204 No Content
 */
export async function deleteGameById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await gameService.deleteGameById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Sets a specific version as the actual (current) version for a game.
 * 
 * @async
 * @param {Request} req - Express request object containing game ID and version ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /games/1/actual-version/5
 * // Sets version with ID 5 as the actual version for game with ID 1
 * // Returns: Updated game with new actual version
 */
export async function setGameVersionAsActual(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameId = Number(req.params.gameId);
    const versionId = Number(req.params.versionId);
    const updatedGame = await gameService.setGameVersionAsActual(gameId, versionId);
    res.json(updatedGame);
  } catch (err) {
    next(err);
  }
}