// src/api/routes/baseRouter.ts
import { Router } from "express";
import { FileRouter } from "@/api/fileRouter.ts";
import { CodeRouter } from "@/api/codeRouter.ts";

export const BaseRouter = (): Router => {
  const router = Router();

  // 파일 및 코드 관련 라우터
  router.use("/files", FileRouter());
  router.use("/codes", CodeRouter());

  return router;
};
