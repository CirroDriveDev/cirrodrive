import { useNavigate } from "react-router-dom";
import { fileMetadataDTOSchema, subFolderDTOSchema } from "@cirrodrive/schemas";
import { FolderContentList } from "@/features/folderContent/ui/FolderContentList.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useFolder } from "@/shared/api/useFolder.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useUpload } from "@/entities/file/api/useUpload.ts";
import { useFolderCreate } from "@/entities/file/api/useFolderCreate.ts";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { createFolder } = useFolderCreate();
  const { data, isLoading, query } = useFolder(user?.rootFolderId ?? -1);
  const { handleFileSelect } = useUpload(user?.rootFolderId ?? -1, {
    onSuccess: () => {
      void query.refetch();
    },
  });

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full space-x-4 p-4">
          <Button onClick={handleFileSelect}>업로드</Button>
          <Button onClick={createFolder}>폴더 생성</Button>
        </div>
        <div className="flex w-full px-4">
          {isLoading || !data ?
            <LoadingSpinner />
          : <FolderContentList
              folders={subFolderDTOSchema.array().parse(data.subFolders)}
              files={fileMetadataDTOSchema.array().parse(data.files)}
            />
          }
        </div>
      </div>
    </SidebarLayout>
  );
}
