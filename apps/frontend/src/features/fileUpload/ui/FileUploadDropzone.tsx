import { useState } from "react";
import { FileIcon } from "lucide-react";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { useUpload } from "@/features/fileUpload/model/useUpload.ts";
import { UploadSuccessModal } from "@/features/fileUpload/ui/UploadSuccessModal.tsx";

export function FileUploadDropzone(): JSX.Element {
  const { upload, isPending } = useUpload();

  const [dragOver, setDragOver] = useState(false);
  const { openModal } = useBoundStore();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (): void => {
    setDragOver(false);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
  ): Promise<void> => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (!files?.[0]) {
      return;
    }

    const file = files[0];

    await upload(file, undefined, {
      onSuccess: (data) => {
        if (!data.code) {
          openModal({
            title: "업로드 실패",
            content: <div>코드가 전송되지 않았습니다.</div>,
          });
          return;
        }

        openModal({
          title: "업로드 성공",
          content: UploadSuccessModal(file.name, data.code),
        });
      },
      onError: (error) => {
        openModal({
          title: "업로드 실패",
          content: <div>{error.message}</div>,
        });
      },
    });
  };

  return (
    <div>
      <form method="post" className="</> flex flex-col gap-4 bg-background">
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
            {isPending ?
              <LoadingSpinner />
            : <>
                <FileIcon className="h-32 w-32 text-blue-500" />
                <p className="text-gray-500">
                  파일을 여기에 드래그하거나 클릭하여 선택하세요.
                </p>
              </>
            }
          </div>
        </label>
      </form>
    </div>
  );
}
