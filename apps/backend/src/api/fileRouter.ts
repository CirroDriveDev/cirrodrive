// src/api/routes/fileRouter.ts
import { Router, Request, Response } from "express";
import multer, { diskStorage } from "multer"; // diskStorage를 명시적으로 임포트
import { prisma } from "@/loaders/prisma.ts"; // Prisma 클라이언트 임포트
import crypto from "crypto";
import fs from "fs"; // fs 모듈 임포트

// 파일 업로드 설정
const storage = diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, `${String(Date.now())}-${file.originalname}`), // Date.now()를 문자열로 변환
});
const upload = multer({ storage });

export const FileRouter = (): Router => {
  const router = Router();

  // 비회원 파일 업로드
  router.post("/", upload.single("file"), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "파일이 전송되지 않았습니다." });
    }

    const { filename, path } = req.file;

    // folderId와 md5Hash 정의
    const folderId = 1; // 예시로 설정, 실제 값을 제공해야 함

    // MD5 해시 생성 함수
    const generateMD5 = (filePath: string): string => {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash("md5").update(fileBuffer).digest("hex");
    };

    // MD5 해시 생성
    const md5Hash = generateMD5(req.file.path);

    // 파일 정보를 데이터베이스에 저장
    const newFile = await prisma.file.create({
      data: {
        name: filename,
        saved_path: path,
        size: req.file.size,
        extension: filename.split('.').pop() ?? '',
        created_at: new Date(),
        updated_at: new Date(),
        folder_id: folderId, // 실제 folder_id 값을 제공
        md5_hash: md5Hash,    // MD5 해시 값을 제공
      },
    });

    // 파일 ID를 생성하고 반환
    res.status(201).json({ fileId: newFile.id });
  });

  // 코드로 파일 다운로드
  router.get("/download", async (req: Request, res: Response) => {
    const code = req.query.code as string;

    // 코드로 파일 다운로드
    const codeData = await prisma.code.findUnique({
      where: { code_string: code },
    });

    if (!codeData) {
      return res.status(404).json({ error: "유효하지 않은 코드입니다." });
    }

    if (new Date() > codeData.expires_at) {
      return res.status(410).json({ error: "코드가 만료되었습니다." });
    }

    const file = await prisma.file.findUnique({
      where: { id: codeData.file_id },
    });

    if (!file) {
      return res.status(404).json({ error: "파일을 찾을 수 없습니다." });
    }

    res.download(file.saved_path, file.name);
  });

  return router;
};
