import { Router } from "express";
import * as gamePermissionsController from "@/controlers/games/gamePermissions.controller";

/**
 * Express router for game permissions-related endpoints.
 * Provides RESTful API routes for game permission management with composite keys.
 * 
 * Routes:
 * - GET /game-permissions - Get all game permissions
 * - GET /game-permissions/:userId/:gameId - Get game permission by user ID and game ID
 * - POST /game-permissions - Create new game permission
 * - PUT /game-permissions/:userId/:gameId - Update game permission by user ID and game ID
 * - DELETE /game-permissions/:userId/:gameId - Delete game permission by user ID and game ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import gamePermissionsRoutes from '@/routes/gamePermissions.routes';
 * app.use('/game-permissions', gamePermissionsRoutes);
 * ```
 */
const router = Router();

// GET /game-permissions - Get all game permissions
router.get("/", gamePermissionsController.getGamePermissions);

// GET /game-permissions/:userId/:gameId - Get game permission by composite key
router.get("/:userId/:gameId", gamePermissionsController.getGamePermissionByKeys);

// POST /game-permissions - Create new game permission
router.post("/", gamePermissionsController.createGamePermission);

// PUT /game-permissions/:userId/:gameId - Update game permission by composite key
router.put("/:userId/:gameId", gamePermissionsController.updateGamePermission);

// DELETE /game-permissions/:userId/:gameId - Delete game permission by composite key
router.delete("/:userId/:gameId", gamePermissionsController.deleteGamePermissionById);

export default router;