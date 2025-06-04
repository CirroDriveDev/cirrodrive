import { TRPCError } from "@trpc/server";
import { subscriptionDTOSchema } from "@cirrodrive/schemas/billing";
import { authedProcedure, router } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { SubscriptionService } from "#services/subscription.service";

const subscriptionService = container.get(SubscriptionService);

export const subscriptionRouter = router({
  /**
   * 현재 사용자의 구독 정보 조회 API
   *
   * @throws UNAUTHORIZED - 인증되지 않은 사용자
   * @throws NOT_FOUND - 구독 정보가 없을 경우
   * @throws INTERNAL_SERVER_ERROR - 서버 오류 발생 시
   */
  getCurrent: authedProcedure
    // 반환 데이터 스키마 정의 - null 허용
    .output(subscriptionDTOSchema.nullable())
    .query(async ({ ctx }) => {
      // 현재 로그인한 사용자의 ID
      const userId = ctx.user.id;

      try {
        // BillingService를 통해 현재 구독 정보 조회
        const currentSubscription =
          await subscriptionService.findCurrentByUser(userId);

        // 구독 정보가 없으면 null 반환
        if (!currentSubscription) {
          return null;
        }

        const subscription = await subscriptionService.getByIdWithPlan(
          currentSubscription.id,
        );

        // 구독 정보 없으면 null 반환
        if (!subscription) {
          return null;
        }

        // 필요한 데이터만 뽑아서 반환
        return subscriptionDTOSchema.parse(subscription);
      } catch {
        // 에러 발생 시 INTERNAL_SERVER_ERROR로 응답
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "구독 정보를 가져오는 중 오류가 발생했습니다.",
        });
      }
    }),
});
