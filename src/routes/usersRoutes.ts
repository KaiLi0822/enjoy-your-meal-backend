import express from "express";
import { addUser } from "../controllers/usersController";
import { validateUser } from "../middlewares/validate";

const usersRoutes = express.Router();

// Add a user with validation middleware
usersRoutes.post("/add", validateUser, addUser);

export default usersRoutes;
