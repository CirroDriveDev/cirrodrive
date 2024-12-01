import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { DragAndDropUpload } from "@/features/folderContent/ui/DragAndDropUpload.tsx";

export function UploadByCodePage(): JSX.Element {
  return (
    // TODO: 반응형 UI 구현
    <Layout header={<Header />}>
      <div className="w-full">
        <div className="flex h-[720px] items-center justify-center">
          <div className="bg-gray-50">
            <DragAndDropUpload />
          </div>
        </div>
      </div>
    </Layout>
  );
}
