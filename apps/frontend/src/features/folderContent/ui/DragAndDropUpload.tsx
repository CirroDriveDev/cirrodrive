import { useState } from "react";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";
import { Modal } from "@/features/folderContent/ui/Modal.tsx";

export function DragAndDropUpload(): JSX.Element {
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUploadPublic();

  const [dragOver, setDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    // Trigger the file upload process
    handleFormSubmit(e);

    // Update modal content based on the result
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

    // Open the modal
    setIsModalOpen(true);
  };

  return (
    <div>
      <form
        method="post"
        onSubmit={handleFormSubmitWithModal}
        className="flex flex-col gap-4"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex h-80 w-96 items-center justify-center rounded border-2 border-dashed transition ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
          }`}
        >
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
            mutation.isPending ?
              "cursor-not-allowed bg-gray-500"
            : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "업로드 중..." : "업로드"}
        </button>
      </form>

      <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
        {modalContent.error ?
          <div className="mt-6 text-red-500">오류: {modalContent.error}</div>
        : <div className="flex-col text-green-500">
            <div className="mt-6">파일 이름: {modalContent.fileName}</div>
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
        }
      </Modal>
    </div>
  );
}
