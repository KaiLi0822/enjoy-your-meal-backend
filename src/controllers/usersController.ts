import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { addUserToDB, getUserByEmail } from "../models/usersModel";
import { User } from "../types/users";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { getRecipesByUser } from "../models/recipesModel";
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
      accessToken, // Send access token to the client
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Failed to add user" });
  }
};

// Fetch menus for the user
export const getRecipes = async (req: Request, res: Response) => {
    const userEmail = req.user?.email;
    if (!userEmail) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }
    try {
      const recipes = await getRecipesByUser(userEmail);
      res.status(200).json({ recipes });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ message: 'Failed to fetch recipes' });
    }
  };
