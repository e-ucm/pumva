import { Request, Response, NextFunction } from "express";
import * as technologyService from "@/services/technology.service";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all technologies from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /technologies
 * // Returns all technologies
 */
export async function getTechnologies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const technologies = await technologyService.getTechnologies();
    res.json(technologies);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single technology by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing technology ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /technologies/1
 * // Returns technology with ID 1
 */
export async function getTechnologyById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const technology = await technologyService.getTechnologyById(Number(req.params.id));
    if (!technology) {
      throw new NotFoundError("Technology not found");
    }
    res.json(technology);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new technology in the database.
 * 
 * @async
 * @param {Request} req - Express request object containing technology data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes validation or database errors to next middleware
 * 
 * @example
 * // POST /technologies
 * // Body: { technology: "Unity" }
 * // Returns: 201 Created with technology object
 */
export async function createTechnology(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { technology } = req.body;
    const newTechnology = await technologyService.createTechnology(technology);
    res.status(201).json(newTechnology);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates a technology in the database by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing technology ID in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /technologies/1
 * // Body: { technology: "Updated Technology Name" }
 * // Returns: 200 OK with updated technology object
 */
export async function updateTechnologyById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const technology = await technologyService.updateTechnology(Number(req.params.id), req.body);
    res.json(technology);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a technology from the database by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing technology ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /technologies/1
 * // Returns: 204 No Content
 */
export async function deleteTechnologyById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await technologyService.deleteTechnologyById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}