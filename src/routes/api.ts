import express from "express";
import recipesRoutes from "./recipesRoutes";
import usersRoutes from "./usersRoutes";
import authRoutes from "./authRoutes"

const router = express.Router();

// Mount specific routes
router.use("/recipes", recipesRoutes);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);

export default router;
