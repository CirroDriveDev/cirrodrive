import { toast } from "react-toastify";
import { FileUploadDropzone } from "#components/FileUploadDropzone.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { FileUploadSuccessModal } from "#components/FileUploadSuccessModal.js";

export function UploadByCodePage(): JSX.Element {
  const { openModal } = useBoundStore();
  
  const onSuccess = (fileId: string, code: string) => {
    openModal({
      title: "업로드 성공",
      content: FileUploadSuccessModal("업로드된 파일", code),
    });
  };

  const onError = (error: string) => {
    toast.error(`파일 업로드에 실패했습니다: ${error}`);
  };

  return (
    // TODO: 반응형 UI 구현
    <div className="flex w-full flex-col">
      <div className="flex flex-grow items-center justify-center">
        <div className="bg-gray-50">
          <FileUploadDropzone
            onSuccess={onSuccess}
            onError={onError}
          />
        </div>
      </div>
    </div>
  );
}
