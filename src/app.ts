import express from "express";
import { auth } from "@/middlewares/auth.middleware";
import userRoutes from "@/routes/user.routes";
import trackerRoutes from "@/routes/tracker.routes";
import technologyRoutes from "@/routes/technology.routes";
import gameRoutes from "@/routes/game.routes";
import gamePermissionsRoutes from "@/routes/gamePermissions.routes";
import gameVersionsRoutes from "@/routes/gameVersions.routes";
import languageRoutes from "@/routes/language.routes";
import teacherGuideRoutes from "@/routes/teacherGuide.routes";

/**
 * Express application instance with configured middleware and routes.
 *
 * Middleware:
 * - express.json(): Parse incoming JSON requests
 * - auth: JWT authentication and role-based authorization
 * - errorMiddleware: Global error handling
 *
 * Routes:
 * - /users: User management endpoints
 * - /trackers: Tracker management endpoints
 * - /technologies: Technology management endpoints
 * - /games: Game management endpoints
 * - /game-permissions: Game permissions management endpoints
 * - /game-versions: Game versions management endpoints
 * - /languages: Language management endpoints
 * - /teacher-guides: Teacher guide management endpoints
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

// Health check endpoint (no authentication required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Apply authentication middleware to all routes except health
app.use(auth);

app.use("/users", userRoutes);
app.use("/trackers", trackerRoutes);
app.use("/technologies", technologyRoutes);
app.use("/games", gameRoutes);
app.use("/game-permissions", gamePermissionsRoutes);
app.use("/game-versions", gameVersionsRoutes);
app.use("/languages", languageRoutes);
app.use("/teacher-guides", teacherGuideRoutes);

import { errorMiddleware } from "@/middlewares/error.middleware";

app.use(errorMiddleware);