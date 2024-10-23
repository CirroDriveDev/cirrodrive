import { Router } from "express";
import { UserRouter } from "@/api/routes/userRouter.ts";
import { SessionRouter } from "@/api/routes/sessionRouter.ts";

export const BaseRouter = (): Router => {
  const router = Router();

  router.use("/users", UserRouter());
  router.use("/sessions", SessionRouter());

  return router;
};
