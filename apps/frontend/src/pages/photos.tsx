import { useNavigate } from "react-router";
import type { EntryDTO } from "@cirrodrive/schemas";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { SidebarLayout } from "@/components/layout/SidebarLayout.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { Sidebar } from "@/components/layout/Sidebar.tsx";
import { FolderName } from "@/components/FolderName.tsx";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner.tsx";
import { EntryList } from "@/components/EntryList.tsx";
import { useEntryByUserList } from "@/services/useEntryListByUser.ts";
import { inferFileType } from "@/utils/inferFileType.ts";

export function PhotosPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    void navigate("/login");
  }

  const { query: entryListByUserQuery } = useEntryByUserList();

  const filteredEntries: EntryDTO[] =
    entryListByUserQuery.data?.filter((entry) => {
      return inferFileType(entry.name) === "image";
    }) ?? [];

  return (
    <SidebarLayout
      header={<Header />} // Pass handler to Header
      sidebar={<Sidebar />}
    >
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <FolderName folderId={null} folderName="사진" />
        </div>
        <div className="flex w-full px-4">
          {entryListByUserQuery.isLoading || !entryListByUserQuery.data ?
            <LoadingSpinner />
          : <EntryList entries={filteredEntries} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
