import { toast } from "react-toastify";
import { Header } from "#components/layout/Header.js";
import { Layout } from "#components/layout/Layout.js";
import { FileUploadDropzone } from "#components/FileUploadDropzone.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { FileUploadSuccessModal } from "#components/FileUploadSuccessModal.js";
import {
  type UploadResultError,
  type UploadResultSuccess,
} from "#types/use-uploader.js";

export function UploadByCodePage(): JSX.Element {
  const { openModal } = useBoundStore();
  // 기본 콜백 정의
  const onSuccess = (result: UploadResultSuccess) => {
    openModal({
      title: "업로드 성공",
      content: FileUploadSuccessModal(result.file.name, result.code),
    });
  };

  const onError = (result: UploadResultError) => {
    toast.error(`파일 업로드에 실패했습니다: ${result.file.name}`);
  };

  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <div className="flex w-full flex-col">
        <div className="flex flex-grow items-center justify-center">
          <div className="bg-gray-50">
            <FileUploadDropzone
              onSingleFileSuccess={onSuccess}
              onSingleFileError={onError}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
