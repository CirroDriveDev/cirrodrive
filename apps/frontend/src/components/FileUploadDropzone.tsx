import { FileIcon } from "lucide-react";
import { useBoundStore } from "#store/useBoundStore.js";
import { useFileUploadHandler } from "#hooks/useFileUploadHandler.js";
import { useDragOverlay } from "#hooks/useDragOverlay.js";

interface FileUploadDropzoneProps {
  maxFiles?: number;
}

export function FileUploadDropzone({
  maxFiles = 1,
}: FileUploadDropzoneProps): JSX.Element {
  const { openModal } = useBoundStore();
  const { handleFiles } = useFileUploadHandler({
    onSuccess: (fileNames: string[]) => {
      openModal({
        title: "업로드 성공",
        content: fileNames.join(", "),
      });
    },
    onError: (errorFiles: string[]) => {
      openModal({
        title: "업로드 실패",
        content: `일부 파일 업로드에 실패했습니다: ${errorFiles.join(", ")}`,
      });
    },
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
        <input type="file" className="hidden" id="file-upload" />
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
