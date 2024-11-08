import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import { router, procedure } from "@/loaders/trpc.ts"; // tRPC 설정 임포트
import { container } from "@/loaders/inversify.ts";
import { CodeService } from "@/services/codeService.ts";

const codeService = container.get(CodeService);

export const codeRouter = router({
  // 코드 생성
  create: procedure
    .input(z.object({ fileId: z.number() }))
    .output(z.object({ codeString: z.string() }))
    .mutation(async ({ input }) => {
      const { fileId } = input;

      const code = await codeService.createCode(fileId);

      return { codeString: code.codeString };
    }),

  // 코드 삭제
  delete: procedure
    .input(z.object({ codeString: z.string() }))
    .mutation(async ({ input }) => {
      const { codeString } = input;

      try {
        await codeService.deleteCode(codeString);
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes("Record to delete does not exist.")
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "코드를 찾을 수 없습니다.",
          });
        }
        throw error;
      }
    }),

  // 코드로 파일 메타데이터 조회
  getFileMetadataByCode: procedure
    .input(z.object({ codeString: z.string() }))
    .output(
      z.object({
        fileId: z.number(),
        fileName: z.string(),
        fileSize: z.number(),
        fileExtension: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { codeString } = input;

      const metadata = await codeService.getCodeMetadata(codeString);

      return metadata;
    }),
});
