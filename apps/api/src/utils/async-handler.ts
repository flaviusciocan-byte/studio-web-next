import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
  ): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
