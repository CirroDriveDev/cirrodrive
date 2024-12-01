import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import { useDragUpload } from "@/entities/file/api/useDragUpload.ts";

interface DragAndDropUploadProps {
  folderId?: number; // 폴더 ID
  onUploadSuccess?: () => void; // 업로드 성공 시 호출할 함수
}

export function DragAndDropUpload({
  folderId,
  onUploadSuccess,
}: DragAndDropUploadProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false);

  const { handleFileSelect } = useDragUpload(folderId ?? 0, {
    onSuccess: () => {
      if (onUploadSuccess) onUploadSuccess(); // 업로드 성공 시 추가 작업 호출
    },
  });

  // 드래그 앤 드롭 공통 처리
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;

    if (files?.[0]) {
      const file = files[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", (folderId ?? "").toString());
      handleFileSelect(formData);
    }
  };

  useEffect(() => {
    const handleDragOver = (e: DragEvent): void => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = (e: DragEvent): void => {
      e.preventDefault();
      setDragOver(false);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  });

  return (
    <div
      onDrop={handleDrop}
      style={{
        visibility: dragOver ? "visible" : "hidden",
      }}
      className="pointer-events-auto flex h-full w-full flex-col items-center justify-center rounded border-2 border-dashed border-blue-500 bg-background opacity-80 transition"
    >
      <FileIcon className="h-32 w-32 text-blue-500" />
      <p className="text-gray-500">파일을 여기에 드래그하세요.</p>
    </div>
  );
}
