import { useState, useEffect } from "react";
import { Modal } from "@/features/folderContent/ui/Modal.tsx";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";

interface DragAndDropUploadProps {
  containerClassName?: string;
  fileAreaClassName?: string;
  buttonClassName?: string;
  fileButtonClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  directionClassName?: string;
}

export function DragAndDropUpload({
  containerClassName = "flex flex-col gap-4",
  fileAreaClassName = "flex h-80 w-96 items-center justify-center rounded border-2 border-dashed transition",
  buttonClassName = "rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600",
  fileButtonClassName = "rounded bg-blue-500 px-4 py-2 text-base text-white hover:bg-blue-600",
  inputClassName = "hidden",
  directionClassName = "flex flex-col gap-4",
}: DragAndDropUploadProps): JSX.Element {
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

    const droppedData = e.dataTransfer.getData("application/json");
    if (droppedData) {
      try {
        interface DraggedFileData {
          file: {
            name: string;
            type?: string;
          };
        }
        const parsedData = JSON.parse(droppedData) as DraggedFileData;

        if (
          typeof parsedData === "object" &&
          parsedData !== null &&
          "file" in parsedData &&
          typeof parsedData.file === "object" &&
          "name" in parsedData.file &&
          typeof parsedData.file.name === "string"
        ) {
          const { file } = parsedData;

          const uploadedFile = new File(["Sample file content"], file.name, {
            type: file.type ?? "application/octet-stream",
          });

          const fileInput = document.createElement("input");
          fileInput.type = "file";
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(uploadedFile);
          fileInput.files = dataTransfer.files;

          const customEvent = {
            target: fileInput,
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          handleFileChange(customEvent);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (error: unknown) {
        setModalContent({
          error:
            error instanceof Error ?
              `드래그된 데이터 처리 오류: ${error.message}`
            : "드래그된 데이터 처리 중 알 수 없는 오류가 발생했습니다.",
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleFormSubmitWithModal = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();

    if (!selectedFile) {
      setModalContent({
        error: "파일을 선택하세요.", // 오류 메시지를 모달에 설정
      });
      setIsModalOpen(true); // 모달 열기
      return;
    }

    setModalContent({
      fileName: selectedFile.name,
      code: "업로드 중...",
      link: "업로드 중...",
    });
    setIsModalOpen(true);

    handleFormSubmit(e);
  };

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

  return (
    <div className={containerClassName}>
      <form
        method="post"
        onSubmit={handleFormSubmitWithModal}
        className={directionClassName}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${fileAreaClassName} ${
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

        <div>
          <input
            type="file"
            onChange={handleFileChange}
            className={inputClassName}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${fileButtonClassName}`}
          >
            파일 선택
          </label>
        </div>

        <div>
          <button
            type="submit"
            className={buttonClassName}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "업로드 중..." : "업로드"}
          </button>
        </div>
      </form>

      <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
        {modalContent.error ?
          <div className="mt-6 text-red-500">{modalContent.error}</div>
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
