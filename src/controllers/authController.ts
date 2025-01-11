// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import { config } from "../utils/config";
// import { getUserByEmail } from "../models/usersModel";

// // Login user
// export const loginUser = async (req: Request, res: Response) => {
//     const { email, password, rememberMe } = req.body;
  
//     try {
//       const user = await getUserByEmail(email);
  
//       if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
  
//       // Generate tokens
//       const accessToken = jwt.sign({ userId: user.userId }, config.jwtSecret, {
//         expiresIn: rememberMe ? "30d" : "15m", // Long-term vs. short-term
//       });
  
//       res.cookie("accessToken", accessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000, // Align with token lifespan
//       });
  
//       res.status(200).json({ message: "Login successful" });
//     } catch (error) {
//       console.error("Error during login:", error);
//       res.status(500).json({ message: "Failed to log in" });
//     }
//   };

// // Refresh access token
// export const refreshAccessToken = (req: Request, res: Response) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh token is required" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string };
//     const newAccessToken = jwt.sign({ userId: decoded.userId }, config.jwtSecret, {
//       expiresIn: config.jwtExpiresIn,
//     });

//     res.status(200).json({ accessToken: newAccessToken });
//   } catch (error) {
//     console.error("Invalid refresh token:", error);
//     res.status(401).json({ message: "Invalid or expired refresh token" });
//   }
// };
