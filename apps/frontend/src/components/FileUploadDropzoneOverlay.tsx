import { FileIcon } from "lucide-react";
import { useFileUploadHandler } from "#hooks/useFileUploadHandler.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { useDragOverlay } from "#hooks/useDragOverlay.js";
import { useUploadFiles } from "#services/file/useUploadFiles.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";

interface DragAndDropUploadOverlayProps {
  folderId?: string; // 폴더 ID
  onUploadSuccess?: () => void; // 업로드 성공 시 호출할 함수
}

export function FileUploadDropzoneOverlay({
  folderId,
  onUploadSuccess,
}: DragAndDropUploadOverlayProps): JSX.Element {
  const { openModal } = useBoundStore();

  const { handleFiles } = useFileUploadHandler({
    useUploadFiles: () => useUploadFiles(usePresignedPostUploader),
    folderId,
    onSuccess: (fileNames) => {
      if (onUploadSuccess) onUploadSuccess();
      openModal({
        title: "업로드 성공",
        content: fileNames.join(", "),
      });
    },
    onError: (errorFiles) => {
      openModal({
        title: "업로드 실패",
        content: `일부 파일 업로드에 실패했습니다: ${errorFiles.join(", ")}`,
      });
    },
  });

  const { dragOver, handleDragOver, handleDragLeave, handleDrop } =
    useDragOverlay({
      onDrop: async (files) => {
        await handleFiles(files);
      },
    });

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
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
