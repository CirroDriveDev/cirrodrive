import { useState, useEffect } from "react";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";
import { useDragUpload } from "@/entities/file/api/useDragUpload.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

interface DragAndDropUploadProps {
  type: "A" | "B"; // A 또는 B 페이지의 동작 구분
  folderId?: number; // type="B"일 경우 필요한 폴더 ID
  onUploadSuccess?: () => void; // 업로드 성공 시 호출할 함수 (B 타입용)
  containerClassName?: string;
  directionClassName?: string;
  fileAreaClassName?: string;
  fileButtonClassName?: string;
  buttonClassName?: string;
  inputClassName?: string;
}

export function DragAndDropUpload({
  type,
  folderId,
  onUploadSuccess,
  containerClassName = "",
  directionClassName = "flex flex-col gap-4",
  fileAreaClassName = "flex h-80 w-96 items-center justify-center rounded border-2 border-dashed transition",
  fileButtonClassName = "cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500",
  buttonClassName = "rounded px-4 py-2 text-white",
  inputClassName = "hidden",
}: DragAndDropUploadProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false);

  // A 타입: useUploadPublic 사용
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUploadPublic();

  // B 타입: useDragUpload 사용
  const { isPending, uploadError, handleFileSelect } = useDragUpload(
    folderId ?? 0,
    {
      onSuccess: () => {
        if (onUploadSuccess) onUploadSuccess(); // 업로드 성공 시 추가 작업 호출
      },
    },
  );

  const { openModal } = useBoundStore();

  // 드래그 앤 드롭 공통 처리
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;

    if (files?.[0]) {
      const file = files[0];

      if (type === "A") {
        handleFileChange({
          target: { files },
        } as React.ChangeEvent<HTMLInputElement>);
      } else if (type === "B") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderId", (folderId ?? "").toString());
        handleFileSelect(formData);
      }
    }
  };

  // A 타입: 업로드 폼 제출 처리
  const handleFormSubmitWithModal = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();

    if (!selectedFile) {
      openModal({
        title: "파일 선택 오류",
        content: <div className="text-red-500">파일을 선택하세요.</div>,
      });
      return;
    }

    handleFormSubmit(e);
  };

  // A 타입: 업로드 상태 변화 감지
  useEffect(() => {
    if (type === "A" && !mutation.isPending) {
      if (mutation.error?.message) {
        openModal({
          title: "업로드 실패",
          content: <div className="text-red-500">{mutation.error.message}</div>,
        });
      } else if (code && selectedFile) {
        openModal({
          title: "업로드 성공",
          content: (
            <div className="flex flex-col text-green-500">
              <div>파일 이름: {selectedFile.name}</div>
              <div>코드: {code}</div>
              <div>
                링크:{" "}
                <a
                  href={`${window.location.origin}/c/${code}`}
                  className="text-blue-500 hover:underline"
                >
                  {window.location.origin}/c/{code}
                </a>
              </div>
            </div>
          ),
        });
      }
    }
  }, [type, mutation.isPending, mutation.error, code, selectedFile, openModal]);

  return (
    <div className={containerClassName}>
      <form
        method="post"
        onSubmit={type === "A" ? handleFormSubmitWithModal : undefined}
        className={directionClassName}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`${fileAreaClassName} ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
          }`}
        >
          {type === "A" && selectedFile ?
            <p className="text-sm text-gray-600">
              선택된 파일: {selectedFile.name}
            </p>
          : <p className="text-gray-500">파일을 여기에 드래그하세요.</p>}
        </div>

        {type === "A" && (
          <>
            <input
              type="file"
              onChange={handleFileChange}
              className={inputClassName}
              id="file-upload"
            />
            <label htmlFor="file-upload" className={fileButtonClassName}>
              파일 선택
            </label>
            <button
              type="submit"
              className={`${buttonClassName} ${
                mutation.isPending ?
                  "cursor-not-allowed bg-gray-500"
                : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "업로드 중..." : "업로드"}
            </button>
          </>
        )}

        {type === "B" && isPending ?
          <p className="text-blue-500">업로드 중...</p>
        : null}
        {type === "B" && uploadError ?
          <p className="text-red-500">오류: {uploadError}</p>
        : null}
      </form>
    </div>
  );
}
