import { trpc } from "#services/trpc";

/**
 * 사용자 저장소 상태 정보를 가져오는 커스텀 훅
 *
 * @returns 저장소 사용량, 총 할당량, 요금제 ID, 용량 초과 여부, 로딩 및 에러 상태
 */
export function useStorage() {
  const query = trpc.storage.getUsage.useQuery();
  const utils = trpc.useUtils();

  const invalidateStorage = () => {
    void utils.storage.getUsage.invalidate();
  };

  return {
    /**
     * 사용한 저장소 크기 (bytes)
     */
    used: query.data?.used ?? 0,

    /**
     * 총 할당된 저장소 크기 (bytes)
     */
    quota: query.data?.quota ?? 0,

    /**
     * 사용 중인 요금제 ID
     */
    planId: query.data?.planId ?? "unknown",

    /**
     * 저장소가 90% 이상 찼는지 여부
     */
    isNearLimit: query.data?.isNearLimit ?? false,

    /**
     * 데이터 요청 중인지 여부
     */
    isPending: query.isPending,

    /**
     * 요청 에러 객체
     */
    error: query.error,

    /**
     * 저장소 사용량 데이터를 새로고침하는 함수
     */
    invalidateStorage,
  };
}
