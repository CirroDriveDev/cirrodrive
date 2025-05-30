import { useCallback, useEffect, useState } from "react";

interface UseDragOverlayOptions {
  onDrop?: (files: FileList) => void | Promise<void>;
}

/**
 * 드래그 오버 상태 및 드롭 이벤트 핸들러를 제공하는 커스텀 훅
 *
 * @param options { onDrop } 사용자가 정의한 onDrop 콜백 (files: FileList) => void |
 *   Promise<void>
 */
export function useDragOverlay(options: UseDragOverlayOptions = {}) {
  const { onDrop } = options;
  const [dragOver, setDragOver] = useState(false);

  // 드래그 진입 이벤트 핸들러 (window 단위)
  useEffect(() => {
    const handleDragEnter = (e: DragEvent): void => {
      e.preventDefault();
      setDragOver(true);
    };
    window.addEventListener("dragenter", handleDragEnter);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
    };
  }, []);

  // 드래그 오버/리브/드롭 핸들러 (컴포넌트 단위)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (onDrop && files && files.length > 0) {
        await onDrop(files);
      }
    },
    [onDrop],
  );

  return {
    dragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setDragOver, // 필요시 직접 제어용
  };
}
