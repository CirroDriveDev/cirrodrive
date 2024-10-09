import { Router } from "express";
import { UserRouter } from "@/api/routes/userRouter.ts";

export const BaseRouter = (): Router => {
  const router = Router();

  router.get("/users", UserRouter());

  return router;
};
