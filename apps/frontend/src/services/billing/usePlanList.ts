/**
 * 요금제 목록을 조회하는 커스텀 훅
 *
 * @returns 요금제 목록 데이터, 로딩 상태, 에러 정보, refetch 함수
 */
export function usePlanList() {
  return {
    /**
     * 요금제 목록을 비동기로 요청하는 함수
     */
    fetchPlans: () => {
      return new Promise(() => {
        throw new Error("Not implemented");
      });
    },
    /**
     * 로딩 상태
     */
    isLoading: false,
    /**
     * 요금제 목록 데이터
     */
    plans: undefined,
    /**
     * 에러 객체
     */
    error: undefined,
  };
}
