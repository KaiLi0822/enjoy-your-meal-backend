import express from "express";
import { getMenus } from "../controllers/menusController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

// Route for user login
router.get("/", authenticate, getMenus);
// router.post("/", authenticate, addMenu);
// router.delete("/:menuId", authenticate, deleteMenu);



export default router;
