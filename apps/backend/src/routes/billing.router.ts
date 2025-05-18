import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "@/loaders/trpc.loader";
import { container } from "@/loaders/inversify.loader.ts";
import { BillingService } from "@/services/billing.service.ts";

const billingService = container.get<BillingService>(BillingService);

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
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unknown error");

        if (error.message.includes("요금제")) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "존재하지 않는 요금제입니다.",
          });
        }

        if (
          error.message.includes("billing key") ||
          error.message.includes("고객 인증")
        ) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "고객 인증에 실패했습니다.",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "결제 인증 중 알 수 없는 오류가 발생했습니다.",
        });
      }
    }),

  getCurrentPlan: authedProcedure.query(async ({ ctx }) => {
  // 타입 단언 추가: ctx.session 타입이 user 포함한다고 명확히 알리기
  const session = ctx.session as { user?: { id: string } } | undefined;
  const userId = session?.user?.id;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "사용자 인증 정보가 없습니다.",
    });
  }

  try {
    const plan = (await billingService.getCurrentPlan(userId)) as
      | { planId: string; name: string }
      | null;

    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "활성화된 요금제가 없습니다.",
      });
    }

    return plan;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "알 수 없는 오류가 발생했습니다.",
    });
  }
}),

});
