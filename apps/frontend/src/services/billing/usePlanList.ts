import { trpc } from "#services/trpc.js";

/**
 * 요금제 목록을 조회하는 커스텀 훅
 *
 * @returns 요금제 목록 데이터, 로딩 상태, 에러 정보, refetch 함수
 */
export function usePlanList() {
  const query = trpc.plan.list.useQuery();

  return {
    /**
     * 요금제 목록 데이터
     */
    plans: query.data,

    /**
     * 로딩 상태 (v5 기준)
     */
    isPending: query.isPending,

    /**
     * 에러 객체
     */
    error: query.error,

    /**
     * 수동으로 다시 요청하는 함수
     */
    fetchPlans: query.refetch,
  };
}
