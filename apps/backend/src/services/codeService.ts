// src/services/codeService.ts
import { prisma } from "@/loaders/prisma.ts";
import { generateCode } from "@/utils/generateCode.ts";

export const codeService = {
  // 코드 생성 메서드
  async createCode(fileId: number) {
    if (!fileId || typeof fileId !== "number") {
      throw new Error("유효한 파일 ID가 필요합니다.");
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

    return newCode.code_string;
  },

  // 코드 삭제 메서드
  async deleteCode(code: string) {
    try {
      await prisma.code.delete({
        where: { code_string: code },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to delete does not exist.")
      ) {
        throw new Error("코드를 찾을 수 없습니다.");
      }
      throw error;
    }
  },

  // 코드로 파일 메타데이터 조회 메서드
  async getCodeMetadata(code: string) {
    const codeData = await prisma.code.findUnique({
      where: { code_string: code },
      include: { file: true },
    });

    if (!codeData) {
      throw new Error("유효하지 않은 코드입니다.");
    }

    return {
      fileId: codeData.file.id,
      fileName: codeData.file.name,
      fileSize: codeData.file.size,
      fileExtension: codeData.file.extension,
    };
  },
};
