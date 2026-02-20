import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void next;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
        requestId: req.requestId,
      },
    });
    return;
  }

  console.error("Unhandled error", { requestId: req.requestId, error });
  res.status(500).json({
    error: {
      message: "Internal server error",
      requestId: req.requestId,
    },
  });
};
