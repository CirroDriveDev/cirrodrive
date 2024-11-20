import { type FileDTO, type FolderDTO } from "@cirrodrive/schemas";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";

export const parseContent = (
  folders: FolderDTO[],
  files: FileDTO[],
): FolderContent[] => {
  const parsedFolders: FolderContent[] = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    type: "folder",
    updatedAt: folder.updatedAt,
    size: null,
  }));
  const parsedFiles: FolderContent[] = files.map((file) => ({
    id: file.id,
    name: file.name,
    type: "file",
    updatedAt: file.updatedAt,
    size: file.size,
  }));

  return [...parsedFolders, ...parsedFiles];
};
