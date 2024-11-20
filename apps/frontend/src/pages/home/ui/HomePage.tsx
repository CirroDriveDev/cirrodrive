import { type FileDTO, type FolderDTO } from "@cirrodrive/schemas";
import { FolderContentList } from "@/features/folderContent/ui/FolderContentList.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";

export function HomePage(): JSX.Element {
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
      name: "example.mp4",
      size: 4096,
      extension: "mp4",
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
      name: "very-very-long-folder-name-very-very-very-very-very-very-very-very-very-very-long",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentFolderId: null,
      ownerId: null,
    },
  ];

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full px-4">
          <FolderContentList folders={exampleFolders} files={exampleFiles} />
        </div>
      </div>
    </SidebarLayout>
  );
}
