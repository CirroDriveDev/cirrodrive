import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import { router, procedure } from "@/loaders/trpc.ts"; // tRPC 설정 임포트
import { container } from "@/loaders/inversify.ts";
import { CodeService } from "@/services/codeService.ts";

const codeService = container.get(CodeService);

export const codeRouter = router({
  // 사용자가 생성한 코드 목록 조회
  getCodes: procedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "사용자가 인증되지 않았습니다.",
      });
    }

    // CodeService의 getCodes 메서드를 호출하여 사용자의 코드 목록을 가져옵니다.
    const codes = await codeService.getCodes(ctx.user.id);
    return codes;
  }),

  create: procedure
    .input(z.object({ fileId: z.number() }))
    .output(z.object({ codeString: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { fileId } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "사용자가 인증되지 않았습니다.",
        });
      }

      // 여기서 추가적으로 파일 ID에 대한 유효성 검사를 할 수도 있습니다.
      const code = await codeService.createCode(fileId);

      return { codeString: code.codeString };
    }),
  // 코드 삭제
  delete: procedure
    .input(z.object({ codeString: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { codeString } = input;

      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "사용자가 인증되지 않았습니다.",
        });
      }

      try {
        await codeService.deleteCode(codeString);
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes("해당 코드가 존재하지 않습니다.")
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
