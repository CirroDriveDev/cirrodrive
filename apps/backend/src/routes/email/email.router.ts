import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { userSchema } from "@cirrodrive/schemas";
import { container } from "@/loaders/inversify.loader.ts";
import { logger } from "@/loaders/logger.loader.ts";
import { router, procedure } from "@/loaders/trpc.loader.ts";
import { EmailService } from "@/services/email.service.ts";

const emailService = container.get<EmailService>(EmailService);

export const emailRouter = router({
  // 이메일 인증 코드 발송
  sendVerification: procedure
    .input(z.object({ email: userSchema.shape.email }))
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await emailService.sendVerificationCode({ to: input.email }); // 인증 코드 생성 및 전송
        return { success: true, message: "인증 코드가 전송되었습니다." };
      } catch (error) {
        logger.error({ email: input.email, error }, "이메일 전송 실패");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "이메일 전송에 실패했습니다.",
        });
      }
    }),

  // 인증 코드 검증
  verifyCode: procedure
    .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
        token: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const token = await emailService.verifyEmailCode(
          input.email,
          input.code,
        );
        return {
          success: true,
          message: "이메일 인증이 완료되었습니다.",
          token,
        };
      } catch (error) {
        logger.error({ email: input.email, error }, "이메일 인증 실패");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "인증 코드가 유효하지 않습니다.",
        });
      }
    }),
});
