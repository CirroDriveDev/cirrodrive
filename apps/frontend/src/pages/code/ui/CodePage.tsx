import { useParams } from "react-router-dom";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { NotFoundPage } from "@/pages/notFound/ui/NotFoundPage.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { useGetFileByCode } from "@/entities/file/api/useGetFileByCode.ts";
import { useDownloadByCode } from "@/entities/file/api/useDownloadByCode.ts";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { EntryIcon } from "@/entities/entry/ui/EntryIcon.tsx";
import { inferFileType } from "@/shared/lib/inferFileType.ts";
import { formatSize } from "@/entities/entry/lib/formatSize.ts";
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
          <div className="flex h-96 w-96 flex-col items-center justify-between space-y-4 bg-accent p-4">
            <EntryIcon
              className="h-32 w-32"
              variant={inferFileType(file.name)}
            />
            <div className="text-2xl">{file.name}</div>
            <div>
              <div className="flex w-full space-x-4 px-4 py-1">
                <div className="w-24">업로드 날짜: </div>
                <div className="">{file.createdAt.toLocaleString()}</div>
              </div>
              <div className="flex w-full space-x-4 px-4 py-1">
                <div className="w-24">크기: </div>
                <div className="">{formatSize(file.size)}</div>
              </div>
            </div>
            {user ?
              <Button variant="default" type="button" onClick={saveToAccount}>
                계정에 저장
              </Button>
            : null}
            <Button
              variant="default"
              className="w-full"
              type="button"
              onClick={download}
            >
              다운로드
            </Button>
          </div>
        : null}
      </div>
    </Layout>
  );
}
