import { Request, Response } from "express";
import { fetchAllRecipes, getRecipesByUserMenu } from "../models/recipesModel";

/**
 * Controller to handle the GET request for fetching all recipes.
 */
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await fetchAllRecipes();
    res.status(200).json({
      message: "Recipes fetched successfully",
      data: recipes,
    });
  } catch (error) {
    console.error("Error in getRecipes controller:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
};


export const getMenuRecipes = async (req: Request, res: Response) => {
    const userEmail = req.user?.email;
    const { menuId } = req.params;
    if (!userEmail) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }
    try {
      const menus = await getRecipesByUserMenu(userEmail, menuId);
      res.status(200).json({ 
        message: 'Menus fetched successfully', 
        data: menus });
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ message: 'Failed to fetch menus' });
    }
  };