import { Request, Response, NextFunction } from "express";
import * as userService from "@/services/user.service";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if(req.query.username) {
      const user = await userService.getUserByUsername(String(req.query.username));
      return res.json(user);
    } else {
      const users = await userService.getUsers();
      res.json(users);
    }
  } catch (err) {
    next(err);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await userService.deleteUserById(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
