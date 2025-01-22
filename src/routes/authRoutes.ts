import express from "express";
import { loginUser, refreshAccessToken, logoutUser, getStatus } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const authRoutes = express.Router();

// Route for user login
authRoutes.post("/login", loginUser);

// Route to refresh access tokens
authRoutes.post("/refresh", refreshAccessToken);

authRoutes.get("/status", authenticate, getStatus);

authRoutes.post("/logout",  logoutUser);

export default authRoutes;
