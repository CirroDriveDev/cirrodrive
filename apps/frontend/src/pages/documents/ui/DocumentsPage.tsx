import { useNavigate } from "react-router-dom";
import type { EntryDTO } from "@cirrodrive/schemas";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { FolderName } from "@/widgets/folderView/ui/FolderName.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { EntryList } from "@/entities/entry/ui/EntryList.tsx";
import { useEntryByUserList } from "@/entities/entry/api/useEntryListByUser.ts";
import { inferFileType } from "@/shared/lib/inferFileType.ts";

export function DocumentsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { query: entryListByUserQuery } = useEntryByUserList();

  const filteredEntries: EntryDTO[] =
    entryListByUserQuery.data?.filter((entry) => {
      return inferFileType(entry.name) === "text";
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
