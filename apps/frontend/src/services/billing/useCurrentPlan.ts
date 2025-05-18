// hooks/useCurrentPlan.ts
import { trpc } from "@/services/trpc.ts";

/**
 * 현재 사용 중인 요금제를 조회하는 커스텀 훅
 *
 * @returns 현재 요금제 정보와 로딩/에러 상태, refetch 함수
 */
export function useCurrentPlan() {
  const query = trpc.billing.getCurrentPlan.useQuery();

  return {
    /**
     * 현재 사용 중인 요금제 정보
     */
    plan: query.data,
    /**
     * 로딩 중 여부
     */
    isLoading: query.isLoading,
    /**
     * 에러 발생 여부
     */
    isError: query.isError,
    /**
     * 에러 객체
     */
    error: query.error,
    /**
     * 요금제 정보를 다시 불러오는 함수
     */
    refetch: query.refetch,
  };
}
