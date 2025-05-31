import { useNavigate } from "react-router";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { useBoundStore } from "#store/useBoundStore.js";
import { FolderName } from "#components/FolderName.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { EntryList } from "#components/EntryList.js";
import { useEntryByUserList } from "#services/useEntryListByUser.js";
import { inferFileType } from "#utils/inferFileType.js";

export function DocumentsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    void navigate("/login");
  }

  const { query: entryListByUserQuery } = useEntryByUserList();

  const filteredEntries: EntryDTO[] =
    entryListByUserQuery.data?.filter((entry) => {
      return inferFileType(entry.name) === "text";
    }) ?? [];

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex h-16 w-full items-center space-x-4 p-4">
        <FolderName folderId={null} folderName="문서" />
      </div>
      <div className="flex w-full px-4">
        {entryListByUserQuery.isLoading || !entryListByUserQuery.data ?
          <LoadingSpinner />
        : <EntryList entries={filteredEntries} />}
      </div>
    </div>
  );
}
