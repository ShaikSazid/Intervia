// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Handle custom domain errors (400, 401, 403, 404, 409)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 2. Handle Zod validation errors globally
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // 3. Fallback for unhandled 500 server crashes
  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}