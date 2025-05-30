import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { BillingService } from "#services/billing.service";
import { PlanService } from "#services/plan.service";

const billingService = container.get<BillingService>(BillingService);
const planService = container.get<PlanService>(PlanService);
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

  getCurrentPlan: authedProcedure
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        interval: z.string(),
        intervalCount: z.number(),
        price: z.number(),
        currency: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const plan = await planService.getCurrentPlanByUserId(userId);

      return plan;
    }),

  getCurrentSubscription: authedProcedure
  .output(
    z.object({
      plan: z.object({
        id: z.string(),
        name: z.string(),
        interval: z.string(),
        intervalCount: z.number(),
        price: z.number(),
        currency: z.string(),
      }),
      subscription: z.object({
        startedAt: z.string().datetime(),
        expiredAt: z.string().datetime(),
        status: z.enum(["active", "canceled", "expired"]),
        billingKeyLast4: z.string().optional(),
      }),
    }),
  )
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const subscriptionInfo = await billingService.getCurrentSubscription(userId);

    if (!subscriptionInfo) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "현재 구독 정보를 찾을 수 없습니다.",
      });
    }

    const status = subscriptionInfo.subscription.status.toLowerCase() as
      | "active"
      | "canceled"
      | "expired";

    return {
      ...subscriptionInfo,
      subscription: {
        ...subscriptionInfo.subscription,
        status,
      },
    };
  }),
  getPaymentHistory: authedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).optional().default(20),
        cursor: z.string().optional(), // 페이징용 cursor
      }),
    )
    .output(
      z.object({
        payments: z.array(
          z.object({
            id: z.string(),
            amount: z.number(),
            currency: z.string(),
            status: z.enum(["paid", "failed", "pending"]),
            paidAt: z.string().datetime(),
            method: z.string(),
            description: z.string().nullable(),
          }),
        ),
        nextCursor: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { limit, cursor } = input;

      const { payments, nextCursor } = await billingService.getPaymentHistory({
        userId,
        limit,
        cursor,
      });

      if (!payments) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "결제 내역을 찾을 수 없습니다.",
        });
      }

      return {
        payments,
        nextCursor: nextCursor ?? null,
      };
    }),
});