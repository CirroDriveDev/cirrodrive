import { useNavigate } from "react-router-dom";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { EntryList } from "@/entities/entry/ui/EntryList.tsx";
import { useTrashEntryList } from "@/entities/entry/api/useTrashEntryList.ts";

export function TrashPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }
  const { query: trashEntryListQuery } = useTrashEntryList();

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full px-4">
          {trashEntryListQuery.isLoading || !trashEntryListQuery.data ?
            <LoadingSpinner />
          : <EntryList entries={trashEntryListQuery.data} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
