import express from "express";
import { loginUser, refreshAccessToken, logoutUser } from "../controllers/authController";

const authRoutes = express.Router();

// Route for user login
authRoutes.post("/login", loginUser);

// Route to refresh access tokens
authRoutes.post("/refresh", refreshAccessToken);


authRoutes.post("/logout", logoutUser);

export default authRoutes;
