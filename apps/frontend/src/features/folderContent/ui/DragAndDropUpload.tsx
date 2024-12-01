import { useState, useEffect } from "react";
import { FileIcon } from "lucide-react";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";

export function DragAndDropUpload(): JSX.Element {
  const { selectedFile, mutation, handleFileChange, upload } = useUploadPublic({
    onSuccess: (data) => {
      openModal({
        title: "업로드 성공",
        content: (
          <div className="flex-col text-green-500">
            <div>파일 이름: {data.file.name}</div>
            <div>코드: {data.code}</div>
            <div>
              링크:{" "}
              <a
                href={generateLink(data.code)}
                className="text-blue-500 hover:underline"
              >
                {generateLink(data.code)}
              </a>
            </div>
            <div>만료일 : 1일</div>
          </div>
        ),
      });
    },
    onError: (error) => {
      openModal({
        title: "업로드 실패",
        content: <div className="text-red-500">{error.message}</div>,
      });
    },
  });

  const [dragOver, setDragOver] = useState(false);
  const { openModal } = useBoundStore();

  const generateLink = (c: string): string => {
    return `${window.location.origin}/c/${c}`;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (): void => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFileChange({
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    upload();
  }, [selectedFile, upload]);

  return (
    <div>
      <form method="post" className="</> flex flex-col gap-4 bg-background">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
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
            {mutation.isPending ?
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
