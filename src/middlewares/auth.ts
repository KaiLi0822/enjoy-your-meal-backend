import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../utils/config";
import logger from "../utils/logger";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {

  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token!, config.jwtSecret) as JwtPayload;

    // Ensure the decoded token contains the expected fields
    if (decoded && "email" in decoded) {
      req.user = {
        email: decoded.email as string,
      }; // Populate user object
      next();
      return;
    }
    // If the token structure is invalid
    res.status(401).json({ message: "Invalid token payload" });
  } catch (error) {
    logger.error(`Error verifying token: ${error}`);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
