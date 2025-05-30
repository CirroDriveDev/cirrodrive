import { trpc } from "#services/trpc.js";

/**
 * 현재 사용 중인 요금제를 조회하는 커스텀 훅
 *
 * @returns 현재 요금제 정보와 로딩/에러 상태, refetch 함수
 */
export function useSubscription() {
  const query = trpc.subscription.getCurrent.useQuery();

  return {
    /**
     * 구독 정보 (요금제 이름, 상태, 결제일, 만료일, 가격)
     */
    subscription: query.data,

    /**
     * 데이터 요청 중 여부
     */
    isPending: query.isPending,

    /**
     * 에러 정보
     */
    error: query.error,

    /**
     * 수동으로 다시 요청하는 함수
     */
    refetch: query.refetch,
  };
}
