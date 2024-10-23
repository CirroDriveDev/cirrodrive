// src/api/routes/baseRouter.ts
import { Router } from "express";
import { UserRouter } from "@/api/routes/userRouter.ts";
import { SessionRouter } from "@/api/routes/sessionRouter.ts";
import { FileRouter } from "@/api/routes/fileRouter.ts";
import { CodeRouter } from "@/api/routes/codeRouter.ts";

export const BaseRouter = (): Router => {
  const router = Router();

  router.use("/users", UserRouter());
  router.use("/sessions", SessionRouter());
  // 파일 및 코드 관련 라우터
  router.use("/files", FileRouter());
  router.use("/codes", CodeRouter());

  return router;
};
