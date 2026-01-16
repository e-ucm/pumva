import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err.message === "User not found") {
    return res.status(404).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
}
