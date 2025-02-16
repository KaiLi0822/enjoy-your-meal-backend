import { Request, Response } from "express";
import { fetchAllRecipes } from "../models/recipesModel";
import logger from "../utils/logger";

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
    logger.error(`Error in getRecipes controller: ${error}`);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
};


