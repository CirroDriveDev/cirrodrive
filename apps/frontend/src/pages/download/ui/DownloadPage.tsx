import { Header } from "@/shared/ui/layout/Header.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useDownload } from "@/pages/download/api/useDownload.ts";
import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";

export function DownloadPage(): JSX.Element {
  const { codeString, query, handleInputChange, handleDownload } =
    useDownload();

  return (
    <Layout header={<Header />}>
      <div className="flex flex-grow items-center justify-center">
        <section className="flex w-96 flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">다운로드</h2>
          <input
            type="text"
            value={codeString}
            onChange={handleInputChange}
            className="mb-1 mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter code"
          />
          <div className="flex w-full flex-col justify-center">
            {query.error ?
              <div className="h-8">
                <p className="text-red-500">{query.error.message}</p>
              </div>
            : null}
            <Button variant="default" type="button" onClick={handleDownload}>
              다운로드
            </Button>
            <div className="mt-4 flex h-8 w-full justify-center">
              {query.isFetching ?
                <LoadingSpinner />
              : null}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
