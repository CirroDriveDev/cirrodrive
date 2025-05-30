import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authedProcedure, router } from "#loaders/trpc.loader";
import { container } from "#loaders/inversify.loader";
import { BillingService } from "#services/billing.service";

// BillingService 인스턴스 가져오기 (DI 컨테이너 사용)
const billingService = container.get<BillingService>(BillingService);

// 결제 상태 타입 정의
type BillingStatus =
  | "ACTIVE"      // 활성 구독
  | "CANCELED"    // 취소된 구독
  | "TRIALING"    // 체험 구독
  | "PAST_DUE"    // 연체 상태
  | "PAUSED"      // 일시 정지
  | "INCOMPLETE"  // 미완료 상태
  | "EXPIRED";    // 만료된 구독

export const subscriptionRouter = router({
  /**
   * 현재 사용자의 구독 정보 조회 API
   *
   * @throws UNAUTHORIZED - 인증되지 않은 사용자
   * @throws NOT_FOUND - 구독 정보가 없을 경우
   * @throws INTERNAL_SERVER_ERROR - 서버 오류 발생 시
   */
  getCurrent: authedProcedure
    // 반환 데이터 스키마 정의
    .output(
      z.object({
        name: z.string(), // 요금제 이름
        status: z.enum(["active", "inactive", "canceled", "expired"]), // 구독 상태 (매핑된 상태)
        billingDate: z.string(), // 구독 시작일 (YYYY-MM-DD)
        expirationDate: z.string(), // 구독 만료일 (YYYY-MM-DD)
        price: z.number(), // 요금제 가격
      }),
    )
    .query(async ({ ctx }) => {
      // 현재 로그인한 사용자의 ID
      const userId = ctx.user.id;

      try {
        // BillingService를 통해 현재 구독 정보 조회
        const subscription = await billingService.getCurrentSubscription(userId);

        // 구독 정보 없으면 404 에러 발생
        if (!subscription) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "구독 정보를 찾을 수 없습니다.",
          });
        }

        // 구독 정보 구조분해 할당
        const { plan, subscription: sub } = subscription;

        /**
         * BillingStatus를 UI에 보여줄 상태로 변환하는 함수
         * @param status BillingStatus
         * @returns "active" | "inactive" | "canceled" | "expired"
         */
        function mapStatus(status: BillingStatus): "active" | "inactive" | "canceled" | "expired" {
          switch (status) {
            case "ACTIVE":
              return "active";       // 활성화 상태
            case "CANCELED":
              return "canceled";     // 취소 상태
            case "EXPIRED":
              return "expired";      // 만료 상태
            // 다음 상태들은 모두 비활성 상태로 처리
            case "TRIALING":
            case "PAST_DUE":
            case "PAUSED":
            case "INCOMPLETE":
              return "inactive";
            default: {
              // Exhaustive 체크용 (모든 상태 커버 안 될 시 에러)
              const _exhaustiveCheck: never = status;
              return _exhaustiveCheck;
            }
          }
        }

        // 구독 상태 매핑
        const status = mapStatus(sub.status as BillingStatus);

        // 필요한 데이터만 뽑아서 반환
        return {
          name: plan.name,                  // 요금제 이름
          status,                          // 매핑된 구독 상태
          billingDate: sub.startedAt.slice(0, 10),    // 시작일 (YYYY-MM-DD)
          expirationDate: sub.expiredAt.slice(0, 10), // 만료일 (YYYY-MM-DD)
          price: plan.price,                // 요금제 가격
        };
      } catch {
        // 에러 발생 시 INTERNAL_SERVER_ERROR로 응답
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "구독 정보를 가져오는 중 오류가 발생했습니다.",
        });
      }
    }),
});
