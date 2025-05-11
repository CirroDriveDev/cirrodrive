import { useNavigate } from "react-router-dom";
import type { EntryDTO } from "@cirrodrive/schemas";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { SidebarLayout } from "@/components/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { Sidebar } from "@/components/SidebarLayout/Sidebar.tsx";
import { FolderName } from "@/components/FolderName.tsx";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner.tsx";
import { EntryList } from "@/components/EntryList.tsx";
import { useEntryByUserList } from "@/services/useEntryListByUser.ts";

export function RecentPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
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
    <SidebarLayout
      header={<Header />} // Pass handler to Header
      sidebar={<Sidebar />}
    >
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
    </SidebarLayout>
  );
}
