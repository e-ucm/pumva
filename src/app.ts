import express from "express";
import userRoutes from "@/routes/user.routes";

export const app = express();

app.use(express.json());

app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

import { errorMiddleware } from "@/middlewares/error.middleware";

app.use(errorMiddleware);