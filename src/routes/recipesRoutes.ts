import express from "express";
import { getAllRecipes } from "../controllers/recipesController";

const router = express.Router();

// Recipes endpoints
router.get("/", getAllRecipes);

export default router;
