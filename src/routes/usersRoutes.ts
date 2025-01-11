import express from "express";
import { addUser } from "../controllers/usersController";
import { validateUser } from "../middlewares/validateMiddleware";

const router = express.Router();

// Add a user with validation middleware
router.post("/add", validateUser, addUser);

export default router;
