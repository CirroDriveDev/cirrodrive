import { useSearchParams } from "react-router";
import { EntryList } from "#components/EntryList.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useEntryByUserList } from "#services/useEntryListByUser.js";
import { FolderName } from "#components/FolderName.js";

export function SearchResultsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") ?? ""; // URL에서 검색어 읽기

  const { query: entryListByUserQuery } = useEntryByUserList(); // 사용자 파일 목록 가져오기

  // 검색어로 필터링
  const filteredEntries =
    entryListByUserQuery.data?.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex h-16 w-full items-center space-x-4 p-4">
        <FolderName folderId={null} folderName="검색 결과" />
      </div>
      <div className="flex w-full px-4">
        {(() => {
          if (entryListByUserQuery.isLoading || !entryListByUserQuery.data) {
            return <LoadingSpinner />;
          }
          if (filteredEntries.length > 0) {
            return <EntryList entries={filteredEntries} />; // 검색어로 필터링된 결과 출력
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
