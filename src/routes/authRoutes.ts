import express from "express";
import { loginUser, refreshAccessToken } from "../controllers/authController";

const authRoutes = express.Router();

// Route for user login
authRoutes.post("/login", loginUser);

// Route to refresh access tokens
authRoutes.post("/refresh", refreshAccessToken);

export default authRoutes;
