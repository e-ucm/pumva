import { Router } from "express";
import { 
  getTrackers, 
  getTrackerById, 
  createTracker, 
  updateTrackerById, 
  deleteTrackerById 
} from "@/controlers/tracker.controller";

/**
 * Express router for tracker-related API endpoints.
 * 
 * Routes:
 * - GET / - Retrieve all trackers
 * - GET /:id - Retrieve a single tracker by ID
 * - POST / - Create a new tracker
 * - PUT /:id - Update a tracker by ID
 * - DELETE /:id - Delete a tracker by ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import trackerRoutes from '@/routes/tracker.routes';
 * app.use('/trackers', trackerRoutes);
 * 
 * // GET /trackers - all trackers
 * // GET /trackers/1 - tracker with ID 1
 * // POST /trackers - create tracker
 * // PUT /trackers/1 - update tracker with ID 1
 * // DELETE /trackers/1 - delete tracker with ID 1
 * ```
 */
const router = Router();

router.get("/", getTrackers);
router.get("/:id", getTrackerById);
router.post("/", createTracker);
router.put("/:id", updateTrackerById);
router.delete("/:id", deleteTrackerById);

export default router;