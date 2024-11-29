import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTrashEntryList } from "@/entities/entry/api/useTrashEntryList.ts";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { EntryList } from "@/entities/entry/ui/EntryList.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";

export function TrashPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  if (user === null) {
    navigate("/login");
  }

  const { query: trashEntryListQuery } = useTrashEntryList();
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어 추적

  // 검색어 기준으로 필터링
  const filteredEntries =
    trashEntryListQuery.data?.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <SidebarLayout
      header={<Header onSearch={setSearchTerm} />}
      sidebar={<Sidebar />}
    >
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full px-4">
          {trashEntryListQuery.isLoading || !trashEntryListQuery.data ?
            <LoadingSpinner />
          : <EntryList entries={filteredEntries} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
