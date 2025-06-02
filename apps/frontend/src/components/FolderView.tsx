import { ChevronRight, PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { EntryList } from "#components/EntryList.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { Button } from "#shadcn/components/Button.js";
import { useEntryList } from "#services/useEntryList.js";
import { useFolderPath } from "#services/useFolderPath.js";
import { FolderName } from "#components/FolderName.js";
import { useBoundStore } from "#store/useBoundStore.js";
import { useFolderCreate } from "#services/file/useFolderCreate.js";
import { FileUploadDropzoneOverlay } from "#components/FileUploadDropzoneOverlay.js";
import { useRenameStore } from "#store/useRenameStore.js";
import { UploadButton } from "#components/UploadButton.js";
import { useFileSearchBarStore } from "#store/useFileSearchBarStore.js";
import { FileSearchBar } from "#components/layout/FileSearchBar.js";

interface FolderViewProps {
  folderId: string;
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
  const { query: folderPathQuery } = useFolderPath(folderId);
  const { filters } = useFileSearchBarStore();

  useEffect(() => {
    setParentFolderId(folderId);
  }, [folderId, setParentFolderId]);

  const sortedEntries =
    entryListQuery.data
      ?.filter((entry) => {
        if (
          filters.updatedAt &&
          !entry.updatedAt.toISOString().includes(filters.updatedAt)
        )
          return false;
        if (
          filters.minSizeMB &&
          entry.type === "file" &&
          entry.size < Number(filters.minSizeMB) * 1024 * 1024
        )
          return false;
        if (
          filters.maxSizeMB &&
          entry.type === "file" &&
          entry.size > Number(filters.maxSizeMB) * 1024 * 1024
        )
          return false;
        if (filters.type !== "all" && entry.type !== filters.type) return false;
        return true;
      })
      ?.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === "folder" ? -1 : 1;
      }) ?? [];

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      {/* 경로 영역 */}
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
          .slice(-2)
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

      {/* 버튼 영역 */}
      <div className="flex w-full space-x-4 px-4 pb-4 justify-between">
        {/* ✅ 검색바 */}
        <div className="flex w-full px-4 pb-2">
          <FileSearchBar />
        </div>
        <div className="flex-grow" />
        <UploadButton folderId={folderId} />
        <Button
          onClick={createFolder}
          className="flex items-center justify-between"
        >
          <PlusIcon />
          <span>폴더</span>
        </Button>
      </div>

      {/* 파일 목록 */}
      <div className="relative flex w-full px-4">
        {entryListQuery.isLoading || !sortedEntries ?
          <LoadingSpinner />
        : <EntryList entries={sortedEntries} />}

        {/* 업로드 오버레이 */}
        <div className="pointer-events-none absolute h-full w-full">
          <FileUploadDropzoneOverlay
            folderId={folderId}
            onSingleFileSuccess={(result) => {
              void entryListQuery.refetch();
            }}
          />
        </div>
      </div>
    </div>
  );
}
