import express from "express";
import { getMenus, deleteMenu } from "../controllers/menusController";
import { authenticate } from "../middlewares/auth";

const menusRoutes = express.Router();

// Route for user login
menusRoutes.get("/", authenticate, getMenus);
// router.post("/", authenticate, addMenu);
menusRoutes.delete("/:menuId", authenticate, deleteMenu);



export default menusRoutes;
