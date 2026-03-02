import type { Request, Response, NextFunction } from "express";
import { AuthError } from "../lib/errors.js";

export const requireType =
  (type: "consumer" | "operator") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.account) {
      next(new AuthError());
      return;
    }
    if (req.account.type !== type) {
      next(new AuthError(`This endpoint requires a ${type} account`));
      return;
    }
    next();
  };
