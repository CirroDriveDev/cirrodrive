import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { BillingService } from "#services/billing.service";
import { PlanService } from "#services/plan.service";

const billingService = container.get<BillingService>(BillingService);
const planService = container.get<PlanService>(PlanService);

/**
 * 요금제(plan) 정보에 대한 zod 스키마
 */
const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  interval: z.string(),
  intervalCount: z.number(),
  price: z.number(),
  currency: z.string(),
});

/**
 * 구독(subscription) 정보에 대한 zod 스키마
 */
const SubscriptionSchema = z.object({
  startedAt: z.string().datetime(),
  expiredAt: z.string().datetime(),
  status: z.enum(["active", "canceled", "expired"]),
  billingKeyLast4: z.string().optional(),
});

/**
 * 결제 내역(payment) 정보에 대한 zod 스키마
 */
const PaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["paid", "failed", "pending"]),
  paidAt: z.string().datetime(),
  method: z.string(),
  description: z.string().nullable(),
});

/**
 * Billing 관련 tRPC 라우터
 *
 * @remarks
 * - 결제 인증, 현재 요금제/구독, 결제 내역, 요금제 할당량 등 제공
 */
export const billingRouter = router({
  /**
   * 결제 인증 및 약정 확정
   *
   * @throws NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR
   */
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

  /**
   * 현재 사용자의 요금제 정보를 반환
   *
   * @returns 현재 요금제 정보
   */
  getCurrentPlan: authedProcedure.output(PlanSchema).query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const plan = await planService.getCurrentPlanByUserId(userId);
    return plan;
  }),

  /**
   * 현재 사용자의 구독 및 요금제 정보를 반환
   *
   * @returns 구독 및 요금제 정보
   * @throws NOT_FOUND (구독 정보 없음)
   */
  getCurrentSubscription: authedProcedure
    .output(
      z.object({
        plan: PlanSchema,
        subscription: SubscriptionSchema,
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const subscriptionInfo =
        await billingService.getCurrentSubscription(userId);
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

 /**
 * 결제 내역 조회 (페이징 지원)
 *
 * @description
 * 사용자의 결제 내역을 조회합니다. 페이징을 위해 limit 및 cursor를 사용할 수 있습니다.
 * 결제 내역이 없을 경우 payments는 빈 배열로 반환되며, 에러는 발생하지 않습니다.
 * 클라이언트는 빈 배열 여부로 결제 내역 유무를 판단해야 합니다.
 *
 * @param input.limit - 조회 개수 (기본값: 20, 최대: 100)
 * @param input.cursor - 페이징 커서 (옵션)
 *
 * @returns 결제 내역 배열 및 다음 커서 (더 불러올 내역이 없으면 nextCursor는 null)
 */

getPaymentHistory: authedProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional().default(20),
      cursor: z.string().optional(),
    }),
  )
  .output(
    z.object({
      payments: z.array(PaymentSchema),
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

    return {
      payments: payments ?? [],
      nextCursor: nextCursor ?? null,
    };
  }),


  /**
   * 특정 요금제의 할당량(Quota) 정보 반환
   *
   * @param input.planId - 요금제 ID
   * @returns Quota, description
   * @throws NOT_FOUND (요금제 정보 없음)
   */
  getPlanQuota: authedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        planId: z.string(),
        quota: z.number(),
        description: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { planId } = input;
      const quotaInfo = await planService.getPlanQuota(planId);
      if (!quotaInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "요금제 정보를 찾을 수 없습니다.",
        });
      }
      return {
        planId,
        quota: quotaInfo.quota ?? 0, // undefined일 경우 0으로 대체
        description: quotaInfo.description,
      };
    }),
});
