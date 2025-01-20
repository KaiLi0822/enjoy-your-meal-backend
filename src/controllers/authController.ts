import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../utils/config";
import { getUserByEmail } from "../models/usersModel";

export const logoutUser = (req: Request, res: Response) => {
    try {
      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
  
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to log out" });
    }
  };

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate an access token for the user
    const accessToken = jwt.sign(
      { email: email },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiresIn } // Short-lived token
    );

    // Generate a refresh token for the user
    const refreshToken = jwt.sign(
      { email: email },
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
      maxAge: rememberMe
        ? config.refreshTokenExpiresInLong * 1000
        : undefined,
    });

    // Return success response with user details and access token
    res.status(200).json({
      message: "Login successful",
      data: accessToken,
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
    };
    const newAccessToken = jwt.sign(
      { email: decoded.email },
      config.jwtSecret,
      {
        expiresIn: config.accessTokenExpiresIn,
      }
    );

    res.status(200).json({ message: "Refresh Successfully", data: newAccessToken });
  } catch (error) {
    console.error("Invalid refresh token:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
