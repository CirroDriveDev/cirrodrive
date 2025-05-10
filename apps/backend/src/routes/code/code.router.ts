import { z } from "zod"; // zod 임포트
import { TRPCError } from "@trpc/server"; // TRPCError 임포트
import { router, procedure, authedProcedure } from "@/loaders/trpc.loader.ts"; // tRPC 설정 임포트
import { container } from "@/loaders/inversify.loader.ts";
import { FileAccessCodeService } from "@/services/file-access-code.service.ts";

const fileAccessCodeService = container.get(FileAccessCodeService);

export const codeRouter = router({
  // 사용자가 생성한 코드 목록 조회
  getCodes: procedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "사용자가 인증되지 않았습니다.",
      });
    }

    const codes = await fileAccessCodeService.listByFileOwnerId({
      userId: ctx.user.id,
    });
    return codes;
  }),

  getByFileId: authedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input }) => {
      const { fileId } = input;

      const code = await fileAccessCodeService.getByFileId({
        fileId,
      });

      return code;
    }),

  create: procedure
    .input(
      z.object({
        fileId: z.string(), // 파일 ID를 입력으로 받음
        expiresAt: z.date().optional(), // 코드 만료 시간을 선택적으로 받음
      }),
    )
    .output(z.object({ codeString: z.string() })) // 생성된 코드 문자열을 반환
    .mutation(async ({ input, ctx }) => {
      const { fileId, expiresAt } = input;

      // 사용자가 인증되지 않은 경우 에러를 던짐
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "사용자가 인증되지 않았습니다.",
        });
      }
      // 코드 생성 시 만료 시간이 제공된 경우 처리
      const code = await fileAccessCodeService.create({
        fileId,
        expiresAt,
      });

      return { codeString: code.code };
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
        await fileAccessCodeService.deleteByCode({
          code: codeString,
        });
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
});
