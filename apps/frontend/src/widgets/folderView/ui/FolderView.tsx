import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
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
import { useFolderCreate } from "@/entities/file/api/useFolderCreate.ts";
import { DragAndDropUploadOverlay } from "@/features/folderContent/ui/DragAndDropUploadOverlay.tsx";
import { useRenameStore } from "@/shared/store/useRenameStore.ts";

interface FolderViewProps {
  folderId: number;
}

export function FolderView({ folderId }: FolderViewProps): JSX.Element {
  const { user } = useBoundStore();
  const { setFolderId } = useRenameStore();
  const { createFolder, setParentFolderId } = useFolderCreate({
    onSuccess: (data) => {
      setFolderId(data.id);
    },
  });
  const { query: entryListQuery } = useEntryList(folderId);
  const { handleFileSelect, isPending } = useUpload(folderId, {
    onSuccess: () => {
      void entryListQuery.refetch();
    },
  });

  // useEffect에 넣어서 렌더링 이후 실행하지 않으면 무한 루프에 빠집니다.
  useEffect(() => {
    setParentFolderId(folderId);
  });

  const { query: folderPathQuery } = useFolderPath(folderId);

  const sortedEntries = entryListQuery.data?.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "folder" ? -1 : 1;
  });

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <FolderName folderId={user!.rootFolderId} folderName="내 파일" />
          {folderPathQuery.data?.length && folderPathQuery.data.length > 3 ?
            <div className="flex h-16 items-center space-x-4">
              <ChevronRight />
              <div className="flex items-center justify-center text-lg font-bold">
                ···
              </div>
            </div>
          : null}
          {folderPathQuery.data
            ?.slice(1)
            .slice(-2, folderPathQuery.data.length)
            .map((path) => (
              <div
                className="flex h-16 items-center space-x-4"
                key={`${path.folderId}:${path.name}`}
              >
                <ChevronRight />
                <FolderName folderId={path.folderId} folderName={path.name} />
              </div>
            ))}
        </div>
        <div className="flex w-full space-x-4 p-4">
          {isPending ?
            <LoadingSpinner />
          : <Button onClick={handleFileSelect}>업로드</Button>}
          <Button onClick={createFolder}>폴더 생성</Button>
        </div>
        <div className="relative flex w-full px-4">
          {entryListQuery.isLoading || !sortedEntries ?
            <LoadingSpinner />
          : <EntryList entries={sortedEntries} />}

          <div className="pointer-events-none absolute h-full w-full">
            <DragAndDropUploadOverlay
              folderId={folderId}
              onUploadSuccess={() => {
                void entryListQuery.refetch();
              }}
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
