import express, { Request, Response, NextFunction } from "express";
import userRoutes from "@/routes/users/user.routes";
import gameRoutes from "@/routes/games/game.routes";
import gamePermissionsRoutes from "@/routes/games/gamePermissions.routes";
import gameVersionsRoutes from "@/routes/games/gameVersions.routes";
import technologyRoutes from "@/routes/games/technology.routes";
import trackerRoutes from "@/routes/games/tracker.routes";
import languageRoutes from "@/routes/teacherGuide/language.routes";
import teacherGuideRoutes from "@/routes/teacherGuide/teacherGuide.routes";
import viewsRoutes from "@/routes/views/views.routes";
import { logger } from "@/lib/logger";

/**
 * Express application instance with configured middleware and routes.
 *
 * Middleware:
 * - express.json(): Parse incoming JSON requests
 * - errorMiddleware: Global error handling
 *
 * Routes:
 * - /users: User management endpoints
 * - /games: Game management endpoints  
 * - /game-permissions: Game permission endpoints
 * - /game-versions: Game version management endpoints
 * - /technologies: Technology management endpoints
 * - /trackers: Tracker management endpoints
 * - /languages: Language management endpoints
 * - /teacher-guides: Teacher guide management endpoints
 * - /views: Database view query endpoints
 * - /health: Health check endpoint
 *
 * @type {express.Express}
 *
 * @example
 * ```typescript
 * import { app } from '@/app';
 *
 * // Use in server.ts
 * app.listen(3000);
 * ```
 */
export const app = express();

app.use(express.json());

app.use((req: Request, _: Response, next : NextFunction) => {
  logger.info(`${req.method} at ${req.originalUrl} with body ${JSON.stringify(req.body)}`);
  next();
})

import { auth } from "@/middlewares";
app.use(auth);
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/users", userRoutes);
app.use("/games", gameRoutes);
app.use("/game-permissions", gamePermissionsRoutes);
app.use("/game-versions", gameVersionsRoutes);
app.use("/technologies", technologyRoutes);
app.use("/trackers", trackerRoutes);
app.use("/languages", languageRoutes);
app.use("/teacher-guides", teacherGuideRoutes);
app.use("/views", viewsRoutes);

import { errorMiddleware } from "@/middlewares/error.middleware";
app.use(errorMiddleware);