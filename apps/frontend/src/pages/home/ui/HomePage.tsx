import { useNavigate } from "react-router-dom";
import { EntryList } from "@/entities/entry/ui/EntryList.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useUpload } from "@/entities/file/api/useUpload.ts";
import { useEntryList } from "@/entities/entry/api/useEntryList.ts";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { query: entryListQuery } = useEntryList(user!.rootFolderId);
  const { handleFileSelect } = useUpload(user!.rootFolderId, {
    onSuccess: () => {
      void entryListQuery.refetch();
    },
  });

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full p-4">
          <Button onClick={handleFileSelect}>업로드</Button>
        </div>
        <div className="flex w-full px-4">
          {entryListQuery.isLoading || !entryListQuery.data ?
            <LoadingSpinner />
          : <EntryList entries={entryListQuery.data} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
