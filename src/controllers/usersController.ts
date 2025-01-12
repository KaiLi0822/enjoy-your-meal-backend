import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { addUserToDB } from "../models/usersModel";
import { User } from "../types/users";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
/**
 * Controller to add a new user.
 */
export const addUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, rememberMe } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
    };

    // Save the user to the database
    await addUserToDB(newUser);

    // Generate an access token for the user
    const accessToken = jwt.sign(
      { email: newUser.email, name: newUser.name },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiresIn } // Short-lived token
    );

    // Generate a refresh token for the user
    const refreshToken = jwt.sign(
      { userId: newUser.email },
      config.jwtSecret,
      { expiresIn: rememberMe ? config.refreshTokenExpiresInLong : config.refreshTokenExpiresInShort } // Long-lived token
    );

    // Set the refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? parseInt(config.refreshTokenExpiresInLong) * 1000 :  parseInt(config.refreshTokenExpiresInShort) * 1000, // 7 days in milliseconds
    });

    // Return success response
    res.status(201).json({
      message: "User added successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
      accessToken, // Send access token to the client
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Failed to add user" });
  }
};
