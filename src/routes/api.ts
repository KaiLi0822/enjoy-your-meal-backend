import express from "express";
import recipesRoutes from "./recipesRoutes";
import usersRoutes from "./usersRoutes";

const router = express.Router();

// Mount specific routes
router.use("/recipes", recipesRoutes);
router.use("/users", usersRoutes);

export default router;
