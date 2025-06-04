import { trpc } from "#services/trpc";

/**
 * 저장소 사용량이 변경되었을 때 발생하는 이벤트
 * 
 * 이 함수는 파일 업로드, 삭제, 이동 등 저장소 사용량에 영향을 주는 
 * 모든 작업 후에 호출되어야 합니다.
 */
export const storageUpdatedEvent = () => {
  // 커스텀 이벤트 발생
  const event = new CustomEvent('storage-updated', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
};

/**
 * 저장소 업데이트 이벤트를 구독하는 커스텀 훅
 * 
 * StorageStatus 컴포넌트에서 사용하여 자동으로 캐시를 무효화합니다.
 */
export function useStorageUpdateListener() {
  const utils = trpc.useUtils();

  const handleStorageUpdate = () => {
    void utils.storage.getUsage.invalidate();
  };

  // 이벤트 리스너 등록/해제
  React.useEffect(() => {
    window.addEventListener('storage-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage-updated', handleStorageUpdate);
    };
  }, []);
}