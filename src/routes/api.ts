import express from "express";
import recipesRoutes from "./recipesRoutes";
import usersRoutes from "./usersRoutes";
import authRoutes from "./authRoutes"
import menuRoutes from "./menusRoutes"

const router = express.Router();

// Mount specific routes
router.use("/recipes", recipesRoutes);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/menus", menuRoutes);

export default router;
