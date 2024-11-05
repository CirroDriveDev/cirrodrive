import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import { router, procedure } from "@/loaders/trpc.ts"; // tRPC 설정 임포트
import { prisma } from "@/loaders/prisma.ts"; // Prisma 클라이언트 임포트
import { generateCode } from "@/utils/generateCode.ts"; // 코드 생성 유틸리티 임포트

export const codeRouter = router({
  // 코드 생성
  createCode: procedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ input }) => {
      const { fileId } = input;

      const codeString = generateCode(8);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const newCode = await prisma.code.create({
        data: {
          code_string: codeString,
          file_id: fileId,
          expires_at: expiresAt,
        },
      });

      return { code: newCode.code_string };
    }),

  // 코드 삭제
  deleteCode: procedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const { code } = input;

      try {
        await prisma.code.delete({
          where: { code_string: code },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes("Record to delete does not exist.")) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "코드를 찾을 수 없습니다.",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `알 수 없는 오류가 발생했습니다: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "알 수 없는 오류가 발생했습니다.",
        });
      }
    }),

  // 코드로 파일 메타데이터 조회
  getCodeMetadata: procedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const { code } = input;

      const codeData = await prisma.code.findUnique({
        where: { code_string: code },
        include: { file: true },
      });

      if (!codeData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "유효하지 않은 코드입니다.",
        });
      }

      return {
        fileId: codeData.file.id,
        fileName: codeData.file.name,
        fileSize: codeData.file.size,
        fileExtension: codeData.file.extension,
      };
    }),
});
