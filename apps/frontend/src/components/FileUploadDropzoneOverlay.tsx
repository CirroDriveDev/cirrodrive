import { FileIcon } from "lucide-react";
import { useDragOverlay } from "#hooks/useDragOverlay.js";
import { useUpload } from "#services/upload/useUpload.js";

interface DragAndDropUploadOverlayProps {
  folderId?: string; // 폴더 ID
  onSuccess?: (fileId: string, code: string) => void;
  onError?: (error: string) => void;
}

export function FileUploadDropzoneOverlay({
  folderId,
  onSuccess,
  onError,
}: DragAndDropUploadOverlayProps): JSX.Element {
  const { uploadFiles } = useUpload({
    onSuccess,
    onError,
  });

  const handleFiles = async (files: FileList | File[]) => {
    if (!files?.length) return;
    await uploadFiles(Array.from(files), { folderId });
  };

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
