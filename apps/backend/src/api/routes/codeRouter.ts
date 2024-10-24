// src/api/routes/codeRouter.ts
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { prisma } from "@/loaders/prisma.ts";
import { generateCode } from "@/utils/generateCode.ts";

interface GenerateCodeRequest {
  fileId: number; // fileId는 number 타입이어야 합니다.
}

export const CodeRouter = (): Router => {
  const router = Router();

  // 코드 생성
  router.post(
    "/",
    async (
      req: Request<unknown, unknown, GenerateCodeRequest>,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const { fileId } = req.body;

        if (!fileId || typeof fileId !== "number") {
          return res
            .status(400)
            .json({ error: "유효한 파일 ID가 필요합니다." });
        }

        const codeString = generateCode(8);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newCode = await prisma.code.create({
          data: {
            code_string: codeString,
            file_id: fileId,
            expires_at: expiresAt,
          },
        });

        res.status(201).json({ code: newCode.code_string });
      } catch (error) {
        next(error); // 에러를 다음 미들웨어로 전달
      }
    },
  );

  // 코드 삭제
  router.delete(
    "/:code",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { code } = req.params;

        await prisma.code.delete({
          where: { code_string: code },
        });

        res.status(204).send();
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Record to delete does not exist.")
        ) {
          return res.status(404).json({ error: "코드를 찾을 수 없습니다." });
        }
        next(error);
      }
    },
  );

  // 코드로 파일 메타데이터 조회
  router.get(
    "/:code/metadata",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { code } = req.params;

        const codeData = await prisma.code.findUnique({
          where: { code_string: code },
          include: { file: true },
        });

        if (!codeData) {
          return res.status(404).json({ error: "유효하지 않은 코드입니다." });
        }

        res.status(200).json({
          fileId: codeData.file.id,
          fileName: codeData.file.name,
          fileSize: codeData.file.size,
          fileExtension: codeData.file.extension,
        });
      } catch (error) {
        next(error);
      }
    });

  return router;
};
