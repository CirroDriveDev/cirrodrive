import { FileIcon } from "lucide-react";
import { useFileUploadHandler } from "#hooks/useFileUploadHandler.js";
import { useDragOverlay } from "#hooks/useDragOverlay.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";
import {
  type UploadResultError,
  type UploadResultSuccess,
  type UploadResult,
} from "#types/use-uploader.js";

interface DragAndDropUploadOverlayProps {
  folderId?: string; // 폴더 ID
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (results: UploadResult[]) => void;
  onSingleFileSuccess?: (result: UploadResultSuccess) => void;
  onSingleFileError?: (result: UploadResultError) => void;
}

export function FileUploadDropzoneOverlay({
  folderId,
  onSuccess,
  onError,
  onSingleFileSuccess,
  onSingleFileError,
}: DragAndDropUploadOverlayProps): JSX.Element {
  const { handleFiles } = useFileUploadHandler({
    useUploader: usePresignedPostUploader,
    folderId,
    onSuccess,
    onError,
    onSingleFileSuccess,
    onSingleFileError,
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
