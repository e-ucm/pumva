import { Router } from "express";
import { 
  getTechnologies, 
  getTechnologyById, 
  createTechnology, 
  updateTechnologyById, 
  deleteTechnologyById 
} from "@/controlers/games/technology.controller";

/**
 * Express router for technology-related API endpoints.
 * 
 * Routes:
 * - GET / - Retrieve all technologies
 * - GET /:id - Retrieve a single technology by ID
 * - POST / - Create a new technology
 * - PUT /:id - Update a technology by ID
 * - DELETE /:id - Delete a technology by ID
 * 
 * @type {Router}
 * 
 * @example
 * ```typescript
 * import technologyRoutes from '@/routes/technology.routes';
 * app.use('/technologies', technologyRoutes);
 * 
 * // GET /technologies - all technologies
 * // GET /technologies/1 - technology with ID 1
 * // POST /technologies - create technology
 * // PUT /technologies/1 - update technology with ID 1
 * // DELETE /technologies/1 - delete technology with ID 1
 * ```
 */
const router = Router();

router.get("/", getTechnologies);
router.get("/:id", getTechnologyById);
router.post("/", createTechnology);
router.put("/:id", updateTechnologyById);
router.delete("/:id", deleteTechnologyById);

export default router;