import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {
  addMenuToDB,
  addUserToDB,
  deleteMenuAndRelatedItems,
  getMenusByUser,
  getUserByEmail,
  addRecipeToDB
} from "../models/usersModel";
import { User } from "../types/users";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { getRecipesByUser } from "../models/recipesModel";
import { Menu } from "../types/menus";
import { Recipe } from "../types/recipes";
import { Ingredient } from "../types/ingredient";
/**
 * Controller to add a new user.
 */
export const addUser = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Check if the user already exists
    const existingUser = await getUserByEmail(email); // Query the database by email
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser: User = {
      PK: `user#${email}`,
      SK: "profile",
      password: hashedPassword,
    };

    // Save the user to the database
    await addUserToDB(newUser);

    // Generate an access token for the user
    const accessToken = jwt.sign(
      { email: email },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiresIn } // Short-lived token
    );

    // Generate a refresh token for the user
    const refreshToken = jwt.sign(
      { userId: email },
      config.jwtSecret,
      {
        expiresIn: rememberMe
          ? config.refreshTokenExpiresInLong
          : config.refreshTokenExpiresInShort,
      } // Long-lived token
    );

    // Set the refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: rememberMe ? config.refreshTokenExpiresInLong * 1000 : undefined,
    });

    // Return success response
    res.status(201).json({
      message: "User added successfully",
      data: accessToken, // Send access token to the client
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Failed to add user" });
  }
};

// Fetch menus for the user
export const getRecipes = async (req: Request, res: Response) => {
  console.log("getRecipes");
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  try {
    const recipes = await getRecipesByUser(userEmail);
    res.status(200).json({
      message: "Recipes fetched successfully",
      data: recipes,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
};

// Fetch menus for the user
export const getMenus = async (req: Request, res: Response) => {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  try {
    const menus = await getMenusByUser(userEmail);
    res.status(200).json({
      message: "Menus fetched successfully",
      data: menus,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ message: "Failed to fetch menus" });
  }
};

// Add a new menu
export const addMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }
    const { menuName } = req.params;

    // Create a new user object
    const newMenu: Menu = {
      PK: `user#${userEmail}`,
      SK: `menu#${menuName}`,
      name: menuName,
    };

    // Save the user to the database
    await addMenuToDB(newMenu);

    res.status(201).json({ message: "Menu added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add menu" });
  }
};

// Delete a menu
export const deleteMenu = async (req: Request, res: Response) => {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  const { menuName } = req.params;

  try {
    const isDeleted = await deleteMenuAndRelatedItems(userEmail, menuName);

    if (isDeleted) {
      res.status(200).json({ message: "Menu deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete menu" });
    }
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ message: "Failed to delete menu" });
  }
};


export const addRecipe = async (req: Request, res: Response): Promise<void> => {
  console.log("addRecipe")
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const { name, description, ingredients, methods, cover } = req.body;

    // Validate input
    if (!name || !description || !Array.isArray(ingredients) || !Array.isArray(methods) || !cover) {
      res.status(400).json({ message: "Invalid input. Please provide all required fields." });
      return;
    }

    // Map ingredients to the correct type
    const parsedIngredients: Ingredient[] = ingredients.map((item: any) => {
      if (!item.name || !item.quantity) {
        throw new Error("Invalid ingredient format");
      }
      return {
        name: item.name,
        quantity: item.quantity,
      };
    });

    // Validate methods
    const parsedMethods: string[] = methods.map((step: any) => {
      if (typeof step !== "string") {
        throw new Error("Invalid method format");
      }
      return step;
    });

    // Create a new recipe object
    const newRecipe: Recipe = {
      PK: `user#${userEmail}`,
      SK: `recipe#${name}`,
      GSI1PK: "recipe",
      name: name,
      description: description,
      ingredients: parsedIngredients,
      methods: parsedMethods,
      cover: cover,
    };

    // Save the recipe to the database
    await addRecipeToDB(newRecipe);

    res.status(201).json({ message: "Recipe added successfully" });
  } catch (error) {
    console.error("Error adding recipe:", error);
    if (error instanceof Error && error.message.includes("Invalid")) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Failed to add recipe" });
    }
  }
};
