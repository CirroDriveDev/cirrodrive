import { FileIcon } from "lucide-react";
import { useFileUploadHandler } from "#hooks/useFileUploadHandler.js";
import { useDragOverlay } from "#hooks/useDragOverlay.js";
import { usePresignedPostUploader } from "#services/file/presigned-post-uploader.js";
import {
  type UploadResultError,
  type UploadResultSuccess,
} from "#types/use-uploader.js";

interface FileUploadDropzoneProps {
  maxFiles?: number;
  onSuccess?: (results: UploadResultSuccess[]) => void;
  onError?: (results: UploadResultError[]) => void;
  onSingleFileSuccess?: (result: UploadResultSuccess) => void;
  onSingleFileError?: (result: UploadResultError) => void;
}

export function FileUploadDropzone({
  maxFiles = 1,
  onSuccess,
  onError,
  onSingleFileSuccess,
  onSingleFileError,
}: FileUploadDropzoneProps): JSX.Element {
  const { handleFiles } = useFileUploadHandler({
    useUploader: usePresignedPostUploader,
    onSuccess,
    onError,
    onSingleFileSuccess,
    onSingleFileError,
    maxFiles,
  });

  const { dragOver, handleDragOver, handleDragLeave, handleDrop } =
    useDragOverlay({
      onDrop: async (files) => {
        await handleFiles(files);
      },
    });

  return (
    <div>
      <form method="post" className="flex flex-col gap-4 bg-background">
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={(event) => {
            const files = event.target.files;
            if (files) {
              void handleFiles(files);
            }
          }}
        />
        <label htmlFor="file-upload">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex h-80 w-96 cursor-pointer flex-col items-center justify-center space-y-4 rounded border-2 border-dashed bg-background text-foreground transition hover:bg-accent hover:text-accent-foreground ${
              dragOver ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <FileIcon className="h-32 w-32 text-blue-500" />
            <p className="text-gray-500">
              파일을 여기에 드래그하거나 클릭하여 선택하세요.
            </p>
          </div>
        </label>
      </form>
    </div>
  );
}
