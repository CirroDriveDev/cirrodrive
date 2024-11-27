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
import { DragAndDropUpload } from "@/features/folderContent/ui/DragAndDropUpload.tsx";

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { data, isLoading, query } = useFolder(user?.rootFolderId ?? -1);
  const { handleFileSelect } = useUpload(user?.rootFolderId ?? -1, {
    onSuccess: () => {
      void query.refetch();
    },
  });

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full p-4">
          <Button onClick={handleFileSelect}>업로드</Button>
          <div>
            {" "}
            <DragAndDropUpload
              containerClassName="grid grid-cols-2 gap-4"
              fileAreaClassName="flex h-10 w-96 items-center justify-center rounded border-4 border-dashed bg-blue-50"
              buttonClassName="rounded bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm text-white flex slfe-center"
              fileButtonClassName="rounded bg-blue-600 hover:bg-blue-500 px-3 py-2 text-sm text-white"
              errorClassName="text-red-500 text-xs"
              directionClassName="flex flex-row"
            />
          </div>
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
