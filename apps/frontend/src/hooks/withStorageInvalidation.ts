import { useCallback } from "react";
import { useStorageActions } from "./useStorageActions";

/**
 * 저장소 사용량 캐시 무효화를 자동으로 처리하는 고차 함수
 * 
 * @param callback - 실행할 콜백 함수
 * @returns 저장소 캐시 무효화가 포함된 래핑된 함수
 */
export function withStorageInvalidation<T extends unknown[], R>(
  callback: (...args: T) => Promise<R>
) {
  return function useWrappedCallback() {
    const { invalidateStorageUsage } = useStorageActions();

    return useCallback(
      async (...args: T): Promise<R> => {
        const result = await callback(...args);
        invalidateStorageUsage();
        return result;
      },
      [invalidateStorageUsage]
    );
  };
}

/**
 * 파일 작업 성공 시 저장소 캐시를 무효화하는 헬퍼
 */
export function useFileActionWithStorageUpdate() {
  const { invalidateStorageUsage } = useStorageActions();

  const onFileActionSuccess = useCallback(() => {
    invalidateStorageUsage();
  }, [invalidateStorageUsage]);

  return { onFileActionSuccess };
}