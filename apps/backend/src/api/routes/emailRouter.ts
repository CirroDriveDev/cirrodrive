import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { container } from "@/loaders/inversify.ts";
import { logger } from "@/loaders/logger.ts";
import { router, procedure } from "@/loaders/trpc.ts";
import { generateVerificationCode } from "@/utils/generateVerificationCode.ts";
import { EmailService } from "@/services/emailService.ts";

const emailService = container.get<EmailService>(EmailService);

export const emailRouter = router({
  // 이메일 인증 코드 발송
  sendVerification: procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const code = generateVerificationCode(); // 6자리 숫자 코드 생성

      try {
        await emailService.sendVerificationCode({ to: input.email, code }); // EmailService 사용
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
    .mutation(({ input }) => {
      const isValid = emailService.verifyEmailCode(input.email, input.code); // EmailService 사용
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "인증 코드가 일치하지 않습니다.",
        });
      }

      return { success: true, message: "이메일 인증이 완료되었습니다." };
    }),
});
