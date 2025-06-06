import { trpc } from "#services/trpc";

/**
 * 저장소 사용량에 영향을 주는 액션들에서 사용할 커스텀 훅
 *
 * 파일 업로드, 삭제, 휴지통 이동 등의 액션 후 저장소 사용량 캐시를 자동으로 무효화합니다.
 */
export function useStorageActions() {
  const utils = trpc.useUtils();

  /**
   * 저장소 사용량 캐시를 무효화합니다. 파일/폴더 변경 작업 후 호출하여 UI를 최신 상태로 유지합니다.
   */
  const invalidateStorageUsage = () => {
    void utils.storage.getUsage.invalidate();
  };

  /**
   * 저장소 관련 모든 캐시를 무효화합니다. 큰 변경사항이 있을 때 사용합니다.
   */
  const invalidateAllStorageData = () => {
    void utils.storage.invalidate();
  };

  return {
    invalidateStorageUsage,
    invalidateAllStorageData,
  };
}
