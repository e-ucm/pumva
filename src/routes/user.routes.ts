import { Router } from "express";
import { getUsers , createUser, deleteUserById } from "@/controlers/user.controller";

/**
 * GET Users
 * @param request 
 * @param param1 pass username as param 
 * @returns selected user
 */
const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", deleteUserById);

export default router;