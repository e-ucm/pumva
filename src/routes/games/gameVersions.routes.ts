import { Router } from "express";
import * as gameVersionsController from "@/controlers/games/gameVersions.controller";

/**
 * Express router for game versions-related endpoints.
 * Provides RESTful API routes for game version management.
 * 
 * Routes:
 * - GET /game-versions - Get all game versions
 * - GET /game-versions/:id - Get game version by ID
 * - POST /game-versions - Create new game version
 * - PUT /game-versions/:id - Update game version by ID
 * - DELETE /game-versions/:id - Delete game version by ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import gameVersionsRoutes from '@/routes/gameVersions.routes';
 * app.use('/game-versions', gameVersionsRoutes);
 * ```
 */
const router = Router();

// GET /game-versions - Get all game versions
router.get("/", gameVersionsController.getGameVersions);

// GET /game-versions/:id - Get game version by ID
router.get("/:id", gameVersionsController.getGameVersionById);

// POST /game-versions - Create new game version
router.post("/", gameVersionsController.createGameVersion);

// PUT /game-versions/:id - Update game version by ID
router.put("/:id", gameVersionsController.updateGameVersionById);

// DELETE /game-versions/:id - Delete game version by ID
router.delete("/:id", gameVersionsController.deleteGameVersionById);

export default router;