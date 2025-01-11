// types/express.d.ts
import { JwtPayload } from "jsonwebtoken";
/**
 * This file extends the Express Request object
 * to include custom properties like `user`.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string; // Custom property
    }
  }
}
