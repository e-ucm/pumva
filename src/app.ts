import express from "express";
import userRoutes from "@/routes/user.routes";

/**
 * Express application instance with configured middleware and routes.
 *
 * Middleware:
 * - express.json(): Parse incoming JSON requests
 * - errorMiddleware: Global error handling
 *
 * Routes:
 * - /users: User management endpoints
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

app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import { errorMiddleware } from "@/middlewares/error.middleware";

app.use(errorMiddleware);