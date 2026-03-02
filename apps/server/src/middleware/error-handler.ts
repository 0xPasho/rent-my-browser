import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import { logger } from "../index.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  logger.error(err, "Unhandled error");
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
};
