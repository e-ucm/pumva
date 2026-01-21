import { Request, Response, NextFunction } from "express";
import * as languageService from "@/services/language.service";
import { NotFoundError } from "@/lib/errors/appErrors";

/**
 * Retrieves all languages from the database.
 * 
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /languages
 * // Returns all languages
 */
export async function getLanguages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const languages = await languageService.getLanguages();
    res.json(languages);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single language by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing language ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // GET /languages/1
 * // Returns language with ID 1
 */
export async function getLanguageById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const language = await languageService.getLanguageById(Number(req.params.id));
    if (!language) {
      throw new NotFoundError("Language not found");
    }
    res.json(language);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new language.
 * 
 * @async
 * @param {Request} req - Express request object containing language data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // POST /languages
 * // Body: { name: "English", iso_code: "en" }
 * // Returns: Created language with 201 status
 */
export async function createLanguage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const language = await languageService.createLanguage(req.body);
    res.status(201).json(language);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing language by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing language ID in URL params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // PUT /languages/1
 * // Body: { name: "Updated English" }
 * // Returns: Updated language
 */
export async function updateLanguageById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const language = await languageService.updateLanguageById(Number(req.params.id), req.body);
    res.json(language);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a language by ID.
 * 
 * @async
 * @param {Request} req - Express request object containing language ID in URL params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function for error handling
 * @returns {Promise<void>}
 * @throws {Error} Passes errors to next middleware
 * 
 * @example
 * // DELETE /languages/1
 * // Returns: 204 No Content
 */
export async function deleteLanguageById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await languageService.deleteLanguageById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}