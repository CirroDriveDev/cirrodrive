import { useNavigate } from "react-router-dom";
import { useTrashEntryList } from "@/entities/entry/api/useTrashEntryList.ts";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { useSearchBarStore } from "@/shared/store/useSearchBarStore.ts";
import { TrashEntryList } from "@/entities/entry/ui/TrashEntryList.tsx";
import { FolderName } from "@/widgets/folderView/ui/FolderName.tsx";

export function TrashPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  if (user === null) {
    navigate("/login");
  }

  const { query: trashEntryListQuery } = useTrashEntryList();
  const { searchTerm } = useSearchBarStore();

  // 검색어 기준으로 필터링
  const filteredEntries =
    trashEntryListQuery.data?.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
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
    </SidebarLayout>
  );
}
