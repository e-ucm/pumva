import { Router } from "express";
import * as languageController from "@/controlers/teacherGuide/language.controller";

/**
 * Express router for language-related endpoints.
 * Provides RESTful API routes for language management.
 * 
 * Routes:
 * - GET /languages - Get all languages
 * - GET /languages/:id - Get language by ID
 * - POST /languages - Create new language
 * - PUT /languages/:id - Update language by ID
 * - DELETE /languages/:id - Delete language by ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import languageRoutes from '@/routes/language.routes';
 * app.use('/languages', languageRoutes);
 * ```
 */
const router = Router();

// GET /languages - Get all languages
router.get("/", languageController.getLanguages);

// GET /languages/:id - Get language by ID
router.get("/:id", languageController.getLanguageById);

// POST /languages - Create new language
router.post("/", languageController.createLanguage);

// PUT /languages/:id - Update language by ID
router.put("/:id", languageController.updateLanguageById);

// DELETE /languages/:id - Delete language by ID
router.delete("/:id", languageController.deleteLanguageById);

export default router;