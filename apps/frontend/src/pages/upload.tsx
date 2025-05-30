import { Header } from "#components/layout/Header.js";
import { Layout } from "#components/layout/Layout.js";
import { FileUploadDropzone } from "#components/FileUploadDropzone.js";

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
