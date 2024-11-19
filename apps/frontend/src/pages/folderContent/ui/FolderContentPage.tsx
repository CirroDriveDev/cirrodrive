import { type FileDTO, type FolderDTO } from "@cirrodrive/schemas";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { FileList } from "@/pages/folderContent/ui/FileList.tsx";
import { FolderList } from "@/pages/folderContent/ui/FolderList.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";

export function FolderContentPage(): JSX.Element {
  const exampleFiles: FileDTO[] = [
    {
      id: 1,
      name: "example.txt",
      size: 1024,
      extension: "txt",
      createdAt: new Date(),
      updatedAt: new Date(),
      trashedAt: null,
      parentFolderId: null,
      ownerId: null,
    },
    {
      id: 2,
      name: "example.png",
      size: 2048,
      extension: "png",
      createdAt: new Date(),
      updatedAt: new Date(),
      trashedAt: null,
      parentFolderId: null,
      ownerId: null,
    },
    {
      id: 3,
      name: "example.jpg",
      size: 4096,
      extension: "jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      trashedAt: null,
      parentFolderId: null,
      ownerId: null,
    },
  ];
  const exampleFolders: FolderDTO[] = [
    {
      id: 4,
      name: "example",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentFolderId: null,
      ownerId: null,
    },
    {
      id: 5,
      name: "example",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentFolderId: null,
      ownerId: null,
    },
  ];
  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div>
        <FolderList folders={exampleFolders} />
        <FileList files={exampleFiles} />
      </div>
    </SidebarLayout>
  );
}
