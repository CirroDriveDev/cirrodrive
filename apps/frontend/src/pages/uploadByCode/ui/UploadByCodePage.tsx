import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { FileUploadDropzone } from "@/features/fileUpload/ui/FileUploadDropzone.tsx";

export function UploadByCodePage(): JSX.Element {
  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <div className="flex w-full flex-col">
        <div className="flex flex-grow items-center justify-center">
          <div className="bg-gray-50">
            <FileUploadDropzone />
          </div>
        </div>
      </div>
    </Layout>
  );
}
