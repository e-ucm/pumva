import { Request, Response, NextFunction } from "express";
import * as trackerService from "@/services/tracker.service";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all trackers from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /trackers
 * // Returns all trackers
 */
export async function getTrackers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const trackers = await trackerService.getTrackers();
    res.json(trackers);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single tracker by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing tracker ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /trackers/1
 * // Returns tracker with ID 1
 */
export async function getTrackerById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tracker = await trackerService.getTrackerById(Number(req.params.id));
    if (!tracker) {
      throw new NotFoundError("Tracker not found");
    }
    res.json(tracker);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new tracker in the database.
 * 
 * @async
 * @param {Request} req - Express request object containing tracker data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes validation or database errors to next middleware
 * 
 * @example
 * // POST /trackers
 * // Body: { technology_id: 1, tracker: "New Tracker" }
 * // Returns: 201 Created with tracker object
 */
export async function createTracker(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { technology_id, tracker } = req.body;
    const newTracker = await trackerService.createTracker(technology_id, tracker);
    res.status(201).json(newTracker);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates a tracker in the database by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing tracker ID in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /trackers/1
 * // Body: { tracker: "Updated Tracker Name" }
 * // Returns: 200 OK with updated tracker object
 */
export async function updateTrackerById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tracker = await trackerService.updateTracker(Number(req.params.id), req.body);
    res.json(tracker);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a tracker from the database by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing tracker ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /trackers/1
 * // Returns: 204 No Content
 */
export async function deleteTrackerById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await trackerService.deleteTrackerById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}