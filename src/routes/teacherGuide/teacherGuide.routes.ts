import { Router } from "express";
import * as teacherGuideController from "@/controlers/teacherGuide/teacherGuide.controller";

/**
 * Express router for teacher guide-related endpoints.
 * Provides RESTful API routes for teacher guide management with composite keys.
 * 
 * Routes:
 * - GET /teacher-guides - Get all teacher guides
 * - GET /teacher-guides/:gameId/:languageId - Get teacher guide by game ID and language ID
 * - POST /teacher-guides - Create new teacher guide
 * - PUT /teacher-guides/:gameId/:languageId - Update teacher guide by game ID and language ID
 * - DELETE /teacher-guides/:gameId/:languageId - Delete teacher guide by game ID and language ID
 * - GET /teacher-guides/complete-permissions-view - Get complete game guide permissions view
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import teacherGuideRoutes from '@/routes/teacherGuide.routes';
 * app.use('/teacher-guides', teacherGuideRoutes);
 * ```
 */
const router = Router();

// GET /teacher-guides - Get all teacher guides
router.get("/", teacherGuideController.getTeacherGuides);

// GET /teacher-guides/complete-permissions-view/:gameId/:languageId - Get complete game guide permissions view
router.get("/complete-permissions-view/:gameId/:languageId", teacherGuideController.getCompleteGameGuidePermissionsView);

// GET /teacher-guides/:gameId/:languageId - Get teacher guide by composite key
router.get("/:gameId/:languageId", teacherGuideController.getTeacherGuideByKeys);

// POST /teacher-guides - Create new teacher guide
router.post("/", teacherGuideController.createTeacherGuide);

// PUT /teacher-guides/:gameId/:languageId - Update teacher guide by composite key
router.put("/:gameId/:languageId", teacherGuideController.updateTeacherGuideByKeys);

// DELETE /teacher-guides/:gameId/:languageId - Delete teacher guide by composite key
router.delete("/:gameId/:languageId", teacherGuideController.deleteTeacherGuideByKeys);

export default router;