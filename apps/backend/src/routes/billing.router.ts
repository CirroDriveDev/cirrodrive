import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "@/loaders/trpc.loader";
import { container } from "@/loaders/inversify.loader.ts";
import { BillingService } from "@/services/billing.service.ts";

// @ts-expect-error -- placeholder for the actual BillingService implementation
const billingService = container.get(BillingService);

export const billingRouter = router({
  confirm: authedProcedure
    .input(
      z.object({
        authKey: z.string(),
        customerKey: z.string(),
        planId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { authKey, customerKey, planId } = input;

      try {
        return await billingService.confirmAgreement({
          authKey,
          customerKey,
          planId,
        });
      } catch (error: unknown) {
        // 서비스에서 ExternalPaymentError를 throw하므로 구체적인 메시지 처리
        if (error instanceof Error) {
          if (error.message.includes("요금제")) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "존재하지 않는 요금제입니다.",
            });
          }

          if (error.message.includes("billing key") || error.message.includes("고객 인증")) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "고객 인증에 실패했습니다.",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "결제 인증 중 알 수 없는 오류가 발생했습니다.",
        });
      }
    }),
});
