import express from "express";
import { addUser, getRecipes, deleteMenu, getMenus, addMenu, addRecipe } from "../controllers/usersController";
import { validateUser } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import { getMenuRecipes } from "../controllers/recipesController";

const usersRoutes = express.Router();

// Add a user with validation middleware
usersRoutes.post("/", validateUser, addUser);
// Get all recipes
usersRoutes.get("/recipes", authenticate, getRecipes);
// Get all recipes that belong to a menu
usersRoutes.get("/:menuId/recipes", authenticate, getMenuRecipes);
// Get all menus
usersRoutes.get("/menus", authenticate, getMenus);
// Delete a menu
usersRoutes.delete("/menus/:menuName", authenticate, deleteMenu);
// Add a menu
usersRoutes.post("/menus/:menuName", authenticate, addMenu);
// Add a recipe with validation middleware
usersRoutes.post("/recipe", authenticate, addRecipe);

export default usersRoutes;
