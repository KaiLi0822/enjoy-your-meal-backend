import express from "express";
import { loginUser, refreshAccessToken } from "../controllers/authController";

const router = express.Router();

// Route for user login
router.post("/login", loginUser);

// Route to refresh access tokens
router.post("/refresh", refreshAccessToken);

export default router;
