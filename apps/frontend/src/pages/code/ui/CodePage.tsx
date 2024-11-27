import { useParams } from "react-router-dom";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { NotFoundPage } from "@/pages/notFound/ui/NotFoundPage.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { useGetFileByCode } from "@/entities/file/api/useGetFileByCode.ts";
import { useDownloadByCode } from "@/entities/file/api/useDownloadByCode.ts";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { FolderContentIcon } from "@/features/folderContent/ui/FolderContentIcon.tsx";
import { inferFileType } from "@/features/folderContent/lib/inferFileType.ts";
import { formatSize } from "@/features/folderContent/lib/formatSize.ts";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useSaveToAccount } from "@/entities/file/api/useSaveToAccount.ts";

interface CodePageParams extends Record<string, string> {
  code: string;
}

export function CodePage(): JSX.Element {
  const { code } = useParams<CodePageParams>();
  const { user } = useBoundStore();

  const { file, error, isLoading } = useGetFileByCode(code ?? "");
  const { saveToAccount } = useSaveToAccount(code ?? "");
  const { download } = useDownloadByCode(code ?? "");

  if (typeof code === "undefined") {
    return <NotFoundPage />;
  }

  if (error) {
    return <NotFoundPage />;
  }

  return (
    <Layout header={<Header />}>
      <div className="flex w-full items-center justify-center">
        {isLoading ?
          <LoadingSpinner />
        : null}
        {!isLoading && file ?
          <div className="flex space-x-2">
            <FolderContentIcon type={inferFileType(file.name)} />
            <div className="">{file.name}</div>
            <div className="">{formatSize(file.size)}</div>
            {user ?
              <Button variant="default" type="button" onClick={saveToAccount}>
                계정에 저장
              </Button>
            : null}
            <Button variant="default" type="button" onClick={download}>
              다운로드
            </Button>
          </div>
        : null}
      </div>
    </Layout>
  );
}
