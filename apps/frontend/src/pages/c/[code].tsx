import { useParams } from "react-router";
import { Header } from "#components/layout/Header.js";
import { Layout } from "#components/layout/Layout.js";
import { NotFoundPage } from "#pages/not-found.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useGetFileByCode } from "#services/file/useGetFileByCode.js";
import { useDownloadByCode } from "#services/file/useDownloadByCode.js";
import { Button } from "#shadcn/components/Button.js";
import { EntryIcon } from "#components/EntryIcon.js";
import { inferFileType } from "#utils/inferFileType.js";
import { formatSize } from "#utils/formatSize.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { useSaveToAccount } from "#services/file/useSaveToAccount.js";

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
