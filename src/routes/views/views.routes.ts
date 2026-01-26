import { Router } from "express";
import { 
  getGamesByUserController, 
  getPublicGamesController, 
  getTeacherGuidesByUserAndGameController, 
  getUserByUsernameController 
} from "@/controlers/views/views.controller";

/**
 * Views router for view-based API endpoints.
 * 
 * All routes follow the pattern: /views/<viewname>/<params>
 * These endpoints provide access to database views that aggregate
 * data from multiple tables for complex queries.
 * 
 * Available view endpoints:
 * - GET /views/games/user/:user_id - Get games for a specific user
 * - GET /views/games/public - Get all public games
 * - GET /views/guides/user/:user_id/game/:game_id - Get teacher guides for user and game
 * - GET /views/users/username/:username - Get user by username
 * 
 * @example
 * ```typescript
 * import viewsRoutes from '@/routes/views.routes';
 * app.use('/views', viewsRoutes);
 * ```
 */

const router = Router();

/**
 * Games view routes
 * Base path: /views/games/
 */
router.get("/games/user/:user_id", getGamesByUserController);
router.get("/games/public", getPublicGamesController);

/**
 * Teacher guides view routes  
 * Base path: /views/guides/
 */
router.get("/guides/user/:user_id/game/:game_id", getTeacherGuidesByUserAndGameController);

/**
 * Users view routes
 * Base path: /views/users/
 */
router.get("/users/username/:username", getUserByUsernameController);

export default router;