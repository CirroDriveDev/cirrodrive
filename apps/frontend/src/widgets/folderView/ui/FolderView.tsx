import { ChevronRight } from "lucide-react";
import { EntryList } from "@/entities/entry/ui/EntryList.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useUpload } from "@/entities/file/api/useUpload.ts";
import { useEntryList } from "@/entities/entry/api/useEntryList.ts";
import { useFolderPath } from "@/widgets/folderView/api/useFolderPath.ts";
import { FolderName } from "@/widgets/folderView/ui/FolderName.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

interface FolderViewProps {
  folderId: number;
}

export function FolderView({ folderId }: FolderViewProps): JSX.Element {
  const { user } = useBoundStore();
  const { query: entryListQuery } = useEntryList(folderId);
  const { handleFileSelect } = useUpload(folderId, {
    onSuccess: () => {
      void entryListQuery.refetch();
    },
  });

  const { query: folderPathQuery } = useFolderPath(folderId);

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <FolderName folderId={user!.rootFolderId} folderName="내 파일" />
          {folderPathQuery.data?.slice(1).map((path) => (
            <>
              <ChevronRight />
              <FolderName
                folderId={path.folderId}
                folderName={path.name}
                key={`${path.folderId}:${path.name}`}
              />
            </>
          ))}
        </div>
        <div className="flex w-full space-x-4 p-4">
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
