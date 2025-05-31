import { useNavigate } from "react-router";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { useBoundStore } from "#store/useBoundStore.js";
import { FolderName } from "#components/FolderName.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { EntryList } from "#components/EntryList.js";
import { useEntryByUserList } from "#services/useEntryListByUser.js";

export function RecentPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    void navigate("/login");
  }

  const { query: entryListByUserQuery } = useEntryByUserList();

  const filteredEntries: EntryDTO[] =
    entryListByUserQuery.data
      ?.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 10) ?? [];

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex h-16 w-full items-center space-x-4 p-4">
        <FolderName folderId={null} folderName="최근 파일" />
      </div>
      <div className="flex w-full px-4">
        {entryListByUserQuery.isLoading || !entryListByUserQuery.data ?
          <LoadingSpinner />
        : <EntryList entries={filteredEntries} />}
      </div>
    </div>
  );
}
