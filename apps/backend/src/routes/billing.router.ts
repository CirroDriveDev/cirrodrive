import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { BillingDTOSchema, PlanSchema } from "@cirrodrive/schemas/billing";
import { router, authedProcedure } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { BillingService } from "#services/billing.service";
import { PlanService } from "#services/plan.service";
import { SubscriptionManagerService } from "#services/subscription-manager.service";

const subscriptionManagerService = container.get<SubscriptionManagerService>(
  SubscriptionManagerService,
);
const billingService = container.get<BillingService>(BillingService);
const planService = container.get<PlanService>(PlanService);

/**
 * Billing 관련 tRPC 라우터
 *
 * @remarks
 * - 결제 인증, 현재 요금제/구독, 결제 내역, 요금제 할당량 등 제공
 */
export const billingRouter = router({
  /**
   * 결제 수단 추가
   *
   * @param input.authKey - 결제 인증 키
   * @param input.customerKey - 고객 키
   */
  registerBilling: authedProcedure
    .input(
      z.object({
        authKey: z.string(),
        customerKey: z.string(),
      }),
    )
    .output(BillingDTOSchema)
    .mutation(async ({ input }) => {
      const { authKey, customerKey } = input;
      const billing = await billingService.registerBilling({
        authKey,
        customerKey,
      });

      return billing;
    }),

  /**
   * 결제 수단이 사용 중인지 확인
   *
   * @param input.billingId - 결제 수단 ID
   * @returns 사용 중인 경우 true, 그렇지 않으면 false
   */
  isBillingUsed: authedProcedure
    .input(z.object({ billingId: z.string().uuid() }))
    .output(z.boolean())
    .query(async ({ input }) => {
      const { billingId } = input;

      const isUsed = await billingService.isBillingUsed(billingId);
      return isUsed;
    }),

  /**
   * 결제 수단 삭제
   *
   * @param input.billingId - 결제 수단 ID
   */
  deleteBilling: authedProcedure
    .input(z.object({ billingId: z.string().uuid() }))
    .output(z.object({ success: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { billingId } = input;
      // 현재 사용자의 결제 수단인지 확인
      const billing = await billingService.getById(billingId);
      if (!billing || billing.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "해당 결제 수단에 대한 권한이 없습니다.",
        });
      }
      // 결제 수단이 사용 중인지 확인
      const isUsed = await billingService.isBillingUsed(billingId);
      if (isUsed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "해당 결제 수단은 현재 사용 중입니다. 삭제할 수 없습니다.",
        });
      }
      // 결제 수단 삭제
      await billingService.deleteById(billingId);
      return { success: true };
    }),

  /**
   * 요금제 구독 생성
   */
  subscribeToPlan: authedProcedure
    .input(
      z.object({
        planId: z.string().uuid(),
        billingId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        success: z.literal(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { planId, billingId } = input;

      await subscriptionManagerService.subscribeToPlan({
        userId,
        planId,
        billingId,
      });

      return { success: true };
    }),

  /**
   * 현재 사용자가 등록한 결제 수단 목록 반환
   *
   * @returns 결제 수단 목록
   */
  getBillingMethods: authedProcedure
    .output(z.array(BillingDTOSchema))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const billingMethods = await billingService.listByUserId(userId);
      return billingMethods.map((method) => BillingDTOSchema.parse(method));
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
