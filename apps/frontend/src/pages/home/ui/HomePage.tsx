import { useNavigate } from "react-router-dom";
import { fileMetadataDTOSchema, subFolderDTOSchema } from "@cirrodrive/schemas";
import { FolderContentList } from "@/features/folderContent/ui/FolderContentList.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { useFolder } from "@/shared/api/useFolder.ts";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { data, isLoading } = useFolder(user?.rootFolderId ?? -1);

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
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
