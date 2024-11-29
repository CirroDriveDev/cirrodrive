import { useState, useEffect } from "react";
import { useUploadPublic } from "@/entities/file/api/useUploadPublic.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

interface DragAndDropUploadProps {
  containerClassName?: string;
  directionClassName?: string;
  fileAreaClassName?: string;
  buttonClassName?: string;
  fileButtonClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  beforetextClassName?: string;
  aftertextClassName?: string;
}

export function DragAndDropUpload({
  containerClassName = "",
  //col. row 사용하려고 만들었음
  directionClassName = "flex flex-col gap-4",
  //input창
  fileAreaClassName = "flex h-80 w-96 items-center justify-center rounded border-2 border-dashed transition",
  //파일 선택 버튼
  fileButtonClassName = "cursor-pointer rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500",
  //전송 버튼
  buttonClassName = "rounded px-4 py-2 text-white",
  //x
  inputClassName = "hidden",
  //전송 버튼 텍스트
  beforetextClassName = "업로드",
  aftertextClassName = "업로드 . . . 중",
}: DragAndDropUploadProps): JSX.Element {
  const { selectedFile, code, mutation, handleFileChange, handleFormSubmit } =
    useUploadPublic();

  const [dragOver, setDragOver] = useState(false);
  const { openModal } = useBoundStore();
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
        // 드래그된 데이터 타입 정의
        interface DraggedFileData {
          file: {
            name: string;
            type?: string;
          };
        }

        // JSON 데이터 파싱
        const parsedData = JSON.parse(droppedData) as DraggedFileData;

        if (
          parsedData &&
          typeof parsedData === "object" &&
          "file" in parsedData &&
          typeof parsedData.file === "object" &&
          typeof parsedData.file.name === "string"
        ) {
          const { name, type = "application/octet-stream" } = parsedData.file;

          // 가상의 파일 객체 생성
          const uploadedFile = new File(["Sample file content"], name, {
            type,
          });

          // FileList 형태로 변환
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(uploadedFile);

          // 가상의 input 요소 생성 및 이벤트 트리거
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.files = dataTransfer.files;

          const customEvent = {
            target: fileInput,
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          // 파일 변경 이벤트 호출
          handleFileChange(customEvent);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (error: unknown) {
        // 오류 처리 및 모달 표시
        const errorMessage =
          error instanceof Error ?
            `드래그된 데이터 처리 오류: ${error.message}`
          : "드래그된 데이터 처리 중 알 수 없는 오류가 발생했습니다.";

        setModalContent({
          error: errorMessage,
        });
        openModal({
          title: "오류 발생",
          content: <div className="text-red-500">{errorMessage}</div>,
        });
      }
    }
  };

  const handleFormSubmitWithModal = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();

    if (!selectedFile) {
      // 파일 미선택 시 모달 표시
      openModal({
        title: "파일 선택 오류",
        content: <div className="text-red-500">파일을 선택하세요.</div>,
      });
      return;
    }

    // 모달 초기화: 업로드 중 상태 설정
    setModalContent({
      fileName: selectedFile.name,
      code: aftertextClassName,
      link: aftertextClassName,
    });

    // 업로드 트리거
    handleFormSubmit(e);
  };

  // 업로드 완료/실패 시 모달 상태 업데이트
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
        title: "실패",
        content: <div className="text-red-500">{modalContent.error}</div>,
      });
    } else if (modalContent.code) {
      openModal({
        title: "성공",
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
          {mutation.isPending ? aftertextClassName : beforetextClassName}
        </button>
      </form>
    </div>
  );
}
