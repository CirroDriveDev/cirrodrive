import { useState, useEffect } from "react";
import { FileIcon } from "lucide-react";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

export function DragAndDropUpload(): JSX.Element {
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUploadPublic();

  const [dragOver, setDragOver] = useState(false);
  const { openModal } = useBoundStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 추가: 오류 메시지 상태
  const [modalContent, setModalContent] = useState<{
    fileName?: string;
    code?: string;
    link?: string;
    error?: string;
  }>({});

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

  const handleFormSubmitWithModal = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("파일을 선택하세요."); // 에러 메시지 설정
      return;
    }

    // 모달 초기화: 업로드 중 상태 설정
    setModalContent({
      fileName: selectedFile.name,
      code: "업로드 중...",
      link: "업로드 중...",
    });

    // 업로드 트리거
    handleFormSubmit(e);
  };

  // 변화 감지하고 출력
  useEffect(() => {
    if (!mutation.isPending) {
      if (mutation.error?.message) {
        setModalContent({
          error: mutation.error.message,
        });
      } else if (code && selectedFile) {
        setModalContent({
          fileName: selectedFile.name,
          code,
          link: generateLink(code),
        });
      }
    }
  }, [mutation.isPending, code, selectedFile, mutation.error]);

  // 모달 출력
  useEffect(() => {
    if (modalContent.error) {
      openModal({
        title: "업로드 실패",
        content: <div className="text-red-500">{modalContent.error}</div>,
      });
    } else if (modalContent.code) {
      openModal({
        title: "업로드 성공",
        content: (
          <div className="flex-col text-green-500">
            <div>파일 이름: {modalContent.fileName}</div>
            <div>코드: {modalContent.code}</div>
            <div>
              링크:{" "}
              <a
                href={modalContent.link}
                className="text-blue-500 hover:underline"
              >
                {modalContent.link}
              </a>
            </div>
            <div>만료일 : 1일</div>
          </div>
        ),
      });
    }
  }, [modalContent, openModal]);

  return (
    <div>
      <form
        method="post"
        onSubmit={handleFormSubmitWithModal}
        className="</> flex flex-col gap-4 bg-background"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex h-80 w-96 flex-col items-center justify-center space-y-4 rounded border-2 border-dashed bg-background text-foreground transition ${
            dragOver ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <FileIcon className="h-32 w-32 text-blue-500" />
          {selectedFile ?
            <p className="text-sm text-gray-600">
              선택된 파일: {selectedFile.name}
            </p>
          : <p className="text-gray-500">
              파일을 여기에 드래그하거나 클릭하여 선택하세요.
            </p>
          }
        </div>

        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
        >
          파일 선택
        </label>

        <button
          type="submit"
          className={`rounded px-4 py-2 text-white ${
            mutation.isPending ? "cursor-not-allowed" : (
              "bg-blue-500 hover:bg-blue-600"
            )
          }`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "업로드 중..." : "업로드"}
        </button>
      </form>

      {/* 에러 메시지 표시 */}
      {errorMessage ?
        <div className="mt-4 text-red-500">{errorMessage}</div>
      : null}
    </div>
  );
}
