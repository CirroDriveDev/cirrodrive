import { useSearchParams } from "react-router";
import { EntryList } from "#components/EntryList.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { trpc } from "#services/trpc.js";
import { FolderName } from "#components/FolderName.js";

export function SearchResultsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") ?? ""; // URL에서 검색어 읽기

  const { data: entries, isLoading } = trpc.entry.search.useQuery({
    searchTerm,
  });

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex h-16 w-full items-center space-x-4 p-4">
        <FolderName folderId={null} folderName="검색 결과" />
      </div>
      <div className="flex w-full px-4">
        {(() => {
          if (isLoading) {
            return <LoadingSpinner />;
          }
          if (entries && entries.length > 0) {
            <EntryList
              entries={entries}
              checkedFileList={[]}
              toggleFileChecked={(
                _file: {
                  fileId: string;
                  name: string;
                },
                _isChecked: boolean,
              ) => {
                throw new Error("Function not implemented.");
              }}
              isAllChecked={false}
              onToggleAll={(_checked: boolean) => {
                throw new Error("Function not implemented.");
              }}
            />;
          }

          return (
            <div className="w-full text-center text-gray-500">
              검색어 &ldquo;{searchTerm}&quot;에 대한 결과가 없습니다.
            </div>
          );
        })()}
      </div>
    </div>
  );
}
