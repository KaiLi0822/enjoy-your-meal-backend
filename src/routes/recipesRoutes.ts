import express from "express";
import { getAllRecipes, getMenuRecipes } from "../controllers/recipesController";

const recipesRoutes = express.Router();

// Recipes endpoints
recipesRoutes.get("/", getAllRecipes);



export default recipesRoutes;
