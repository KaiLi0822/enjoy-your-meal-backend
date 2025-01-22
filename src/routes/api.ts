import express from "express";
import recipesRoutes from "./recipesRoutes";
import usersRoutes from "./usersRoutes";
import authRoutes from "./authRoutes"
import s3Routes from "./s3Routes";

const router = express.Router();

// Mount specific routes
router.use("/recipes", recipesRoutes);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/s3", s3Routes);

export default router;
