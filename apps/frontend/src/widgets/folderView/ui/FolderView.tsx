import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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

interface FolderViewProps {
  folderId: number;
  type?: "image" | "file" | "folder"; // 문서, 사진 페이지를 위한 타입 추가
}

const isImageFile = (name: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const fileExtension = name.split(".").pop()?.toLowerCase();
  return fileExtension ? imageExtensions.includes(fileExtension) : false;
};

export function FolderView({ folderId, type }: FolderViewProps): JSX.Element {
  const { user } = useBoundStore();
  const { createFolder, setParentFolderId } = useFolderCreate();
  const { query: entryListQuery } = useEntryList(folderId);
  const { handleFileSelect } = useUpload(folderId, {
    onSuccess: () => {
      void entryListQuery.refetch();
    },
  });
  const { query: folderPathQuery } = useFolderPath(folderId);

  const [searchTerm, setSearchTerm] = useState(""); // 검색어 추적
  // useEffect에 넣어서 렌더링 이후 실행하지 않으면 무한 루프에 빠집니다.
  useEffect(() => {
    setParentFolderId(folderId);
  }, [folderId, setParentFolderId]);

  // 검색어로 필터링
  const filteredEntries =
    entryListQuery.data?.filter((entry) => {
      const matchesSearch = entry.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        !type ||
        (type === "image" && isImageFile(entry.name)) ||
        (type === "file" &&
          entry.type === "file" &&
          !isImageFile(entry.name)) ||
        (type === "folder" && entry.type === "folder");

      return matchesSearch && matchesType;
    }) ?? [];

  return (
    <SidebarLayout
      header={<Header />} // Pass handler to Header
      sidebar={<Sidebar />}
    >
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <FolderName folderId={user!.rootFolderId} folderName="내 파일" />
          {folderPathQuery.data?.slice(1).map((path) => (
            <div
              className="flex h-16 w-full items-center space-x-4"
              key={`${path.folderId}:${path.name}`}
            >
              <ChevronRight />
              <FolderName folderId={path.folderId} folderName={path.name} />
            </div>
          ))}
        </div>
        <div className="flex w-full space-x-4 p-4">
          <Button onClick={handleFileSelect}>업로드</Button>
          <Button onClick={createFolder}>폴더 생성</Button>
        </div>
        <div className="flex w-full px-4">
          {entryListQuery.isLoading || !entryListQuery.data ?
            <LoadingSpinner />
          : <EntryList entries={filteredEntries} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
