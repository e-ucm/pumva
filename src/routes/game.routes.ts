import { Router } from "express";
import * as gameController from "@/controlers/game.controller";

/**
 * Express router for game-related endpoints.
 * Provides RESTful API routes for game management.
 * 
 * Routes:
 * - GET /games - Get all games
 * - GET /games/:id - Get game by ID  
 * - POST /games - Create new game
 * - PUT /games/:id - Update game by ID
 * - DELETE /games/:id - Delete game by ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import gameRoutes from '@/routes/game.routes';
 * app.use('/games', gameRoutes);
 * ```
 */
const router = Router();

// GET /games - Get all games
router.get("/", gameController.getGames);

// GET /games/:id - Get game by ID
router.get("/:id", gameController.getGameById);

// POST /games - Create new game
router.post("/", gameController.createGame);

// PUT /games/:id - Update game by ID
router.put("/:id", gameController.updateGameById);

// DELETE /games/:id - Delete game by ID
router.delete("/:id", gameController.deleteGameById);

export default router;