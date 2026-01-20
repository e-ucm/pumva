import { Request, Response, NextFunction } from "express";
import * as teacherGuideService from "@/services/teacherGuide.service";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Retrieves all teacher guides from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /teacher-guides
 * // Returns all teacher guides
 */
export async function getTeacherGuides(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherGuides = await teacherGuideService.getTeacherGuides();
    res.json(teacherGuides);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single teacher guide by composite key (game_id, language_id).
 * 
 * @async
 * @param {Request} req - Express request object containing gameId and languageId in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /teacher-guides/1/2
 * // Returns teacher guide for game_id=1 and language_id=2
 */
export async function getTeacherGuideByKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameId = Number(req.params.gameId);
    const languageId = Number(req.params.languageId);
    const teacherGuide = await teacherGuideService.getTeacherGuideById(gameId, languageId);
    if (!teacherGuide) {
      throw new NotFoundError("Teacher guide not found");
    }
    res.json(teacherGuide);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new teacher guide.
 * 
 * @async
 * @param {Request} req - Express request object containing teacher guide data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // POST /teacher-guides
 * // Body: { game_id: 1, language_id: 2, content: "Guide content" }
 * // Returns: Created teacher guide with 201 status
 */
export async function createTeacherGuide(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherGuide = await teacherGuideService.createTeacherGuide(req.body);
    res.status(201).json(teacherGuide);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing teacher guide by composite key (game_id, language_id).
 * 
 * @async
 * @param {Request} req - Express request object containing gameId and languageId in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /teacher-guides/1/2
 * // Body: { content: "Updated guide content" }
 * // Returns: Updated teacher guide
 */
export async function updateTeacherGuideByKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameId = Number(req.params.gameId);
    const languageId = Number(req.params.languageId);
    const teacherGuide = await teacherGuideService.updateTeacherGuideById(gameId, languageId, req.body);
    res.json(teacherGuide);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a teacher guide by composite key (game_id, language_id).
 * 
 * @async
 * @param {Request} req - Express request object containing gameId and languageId in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /teacher-guides/1/2
 * // Returns: 204 No Content
 */
export async function deleteTeacherGuideByKeys(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameId = Number(req.params.gameId);
    const languageId = Number(req.params.languageId);
    await teacherGuideService.deleteTeacherGuideById(gameId, languageId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves game guide permissions view with complete details.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /teacher-guides/complete-permissions-view/:gameId/:languageId
 * // Returns complete game guide permissions
 */
export async function getCompleteGameGuidePermissionsView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gameId = Number(req.params.gameId);
    const languageId = Number(req.params.languageId);
    const permissions = await teacherGuideService.getTeacherGuidesByUserAndGame(languageId, gameId);
    res.json(permissions);
  } catch (err) {
    next(err);
  }
}