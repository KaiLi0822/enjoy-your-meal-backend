import express from "express";
import { addUser, getRecipes } from "../controllers/usersController";
import { validateUser } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";

const usersRoutes = express.Router();

// Add a user with validation middleware
usersRoutes.post("/", validateUser, addUser);
usersRoutes.get("/recipes", authenticate, getRecipes);

export default usersRoutes;
