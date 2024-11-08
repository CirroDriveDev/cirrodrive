// src/api/routes/fileRouter.ts
import crypto from "node:crypto";
import fs from "node:fs";
import { Router, type Request, type Response } from "express";
import multer, { diskStorage } from "multer";
import { prisma } from "@/loaders/prisma.ts";

// 파일 업로드 설정
const storage = diskStorage({
  destination: (
    _: Express.Request,
    __: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "data/");
  },
  filename: (
    _: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, `${String(Date.now())}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const FileRouter = (): Router => {
  const router = Router();

  // 비회원 파일 업로드
  router.post(
    "/",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!req.file) {
        return res.status(400).json({ error: "파일이 전송되지 않았습니다." });
      }

      const { filename, path } = req.file;
      const folderId = 1;

      // MD5 해시 생성 함수
      const generateMD5 = (filePath: string): string => {
        const fileBuffer = fs.readFileSync(filePath);
        return crypto.createHash("md5").update(fileBuffer).digest("hex");
      };

      const md5Hash = generateMD5(req.file.path);

      const newFile = await prisma.file.create({
        data: {
          name: filename,
          savedPath: path,
          size: req.file.size,
          extension: filename.split(".").pop() ?? "",
          createdAt: new Date(),
          updatedAt: new Date(),
          folderId,
          hash: md5Hash,
        },
      });

      res.status(201).json({ fileId: newFile.id });
    },
  );

  // 코드로 파일 다운로드
  router.get("/download", async (req: Request, res: Response) => {
    const code = req.query.code as string;

    const codeData = await prisma.code.findUnique({
      where: { codeString: code },
    });

    if (!codeData) {
      return res.status(404).json({ error: "유효하지 않은 코드입니다." });
    }

    if (new Date() > codeData.expiresAt) {
      return res.status(410).json({ error: "코드가 만료되었습니다." });
    }

    const file = await prisma.file.findUnique({
      where: { id: codeData.fileId },
    });

    if (!file) {
      return res.status(404).json({ error: "파일을 찾을 수 없습니다." });
    }

    res.download(file.savedPath, file.name);
  });

  return router;
};
