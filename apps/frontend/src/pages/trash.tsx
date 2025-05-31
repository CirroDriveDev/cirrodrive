import { useNavigate } from "react-router";
import { useTrashEntryList } from "#services/useTrashEntryList.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useSearchBarStore } from "#store/useSearchBarStore.js";
import { TrashEntryList } from "#components/TrashEntryList.js";
import { FolderName } from "#components/FolderName.js";

export function TrashPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  if (user === null) {
    void navigate("/login");
  }

  const { query: trashEntryListQuery } = useTrashEntryList();
  const { searchTerm } = useSearchBarStore();

  // 검색어 기준으로 필터링
  const filteredEntries =
    trashEntryListQuery.data?.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex h-16 w-full items-center space-x-4 p-4">
        <FolderName folderId={null} folderName="휴지통" />
      </div>
      <div className="flex w-full px-4">
        {trashEntryListQuery.isLoading || !trashEntryListQuery.data ?
          <LoadingSpinner />
        : <TrashEntryList entries={filteredEntries} />}
      </div>
    </div>
  );
}
