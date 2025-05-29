import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import {
  useUploadFiles,
  type UploadRequest,
} from "#services/file/useUploadFiles.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";
import { useBoundStore } from "#store/useBoundStore.js";

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

  // useUpload → useUploadFiles + usePresignedPostUploader
  const { uploadFiles, uploadResults } = useUploadFiles(
    usePresignedPostUploader,
  );

  // 드래그 앤 드롭 공통 처리
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
  ): Promise<void> => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (!files?.length) return;

    const uploadRequests: UploadRequest[] = Array.from(files).map((file) => ({
      file,
      folderId,
    }));
    await uploadFiles(uploadRequests);

    const hasError = uploadResults.some((r) => !r.success);
    if (hasError) {
      openModal({
        title: "업로드 실패",
        content: <div>일부 파일 업로드에 실패했습니다.</div>,
      });
      return;
    }
    if (onUploadSuccess) onUploadSuccess();
    openModal({
      title: "업로드 성공",
      content: <div>{uploadResults.map((r) => r.file.name).join(", ")}</div>,
    });
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
