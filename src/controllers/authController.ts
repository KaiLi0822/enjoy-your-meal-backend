import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../utils/config";
import { getUserByEmail } from "../models/usersModel";

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate an access token for the user
    const accessToken = jwt.sign(
      { email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiresIn } // Short-lived token
    );

    // Generate a refresh token for the user
    const refreshToken = jwt.sign(
      { email: user.email, name: user.name },
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe
        ? parseInt(config.refreshTokenExpiresInLong) * 1000
        : parseInt(config.refreshTokenExpiresInShort) * 1000, // 7 days in milliseconds
    });

    // Return success response with user details and access token
    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
};

// Refresh access token
export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
      email: string;
      name: string;
    };
    const newAccessToken = jwt.sign(
      { email: decoded.email, name: decoded.name },
      config.jwtSecret,
      {
        expiresIn: config.accessTokenExpiresIn,
      }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Invalid refresh token:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
