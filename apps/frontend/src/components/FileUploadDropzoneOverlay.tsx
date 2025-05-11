import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import { useUpload } from "@/services/useUpload.ts";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { FileUploadSuccessModal } from "@/components/FileUploadSuccessModal.tsx";

interface DragAndDropUploadOverlayProps {
  folderId?: string; // 폴더 ID
  onUploadSuccess?: () => void; // 업로드 성공 시 호출할 함수
}

export function FileUploadDropzoneOverlay({
  folderId,
  onUploadSuccess,
}: DragAndDropUploadOverlayProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false);
  const { openModal } = useBoundStore();

  const { upload, error: uploadError } = useUpload();

  // 드래그 앤 드롭 공통 처리
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
  ): Promise<void> => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;

    if (files?.[0]) {
      const file = files[0];

      const { code } = await upload(file, folderId);
      if (uploadError) {
        openModal({
          title: "업로드 실패",
          content: <div>{uploadError?.message}</div>,
        });
        return;
      }

      if (onUploadSuccess) {
        onUploadSuccess();
      }
      openModal({
        title: "업로드 성공",
        content: FileUploadSuccessModal(file.name, code),
      });
    }
  };

  useEffect(() => {
    const handleDragEnter = (e: DragEvent): void => {
      e.preventDefault();
      setDragOver(true);
    };

    window.addEventListener("dragenter", handleDragEnter);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
    };
  });

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      style={{
        visibility: dragOver ? "visible" : "hidden",
      }}
      className="pointer-events-auto flex h-full w-full flex-col items-center justify-center space-y-4 rounded border-2 border-dashed border-blue-500 bg-background opacity-80 transition"
    >
      <FileIcon className="pointer-events-none h-32 w-32 text-blue-500" />
      <p className="pointer-events-none text-gray-500">
        파일을 여기에 드래그하세요.
      </p>
    </div>
  );
}
