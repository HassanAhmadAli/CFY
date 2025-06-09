import express, { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: any,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Handle unexpected errors
  console.error("Unhandled error:", error);
  return res.status(500).json({
    status: "error",
    message: error.message || "Something went wrong",
  });
};
