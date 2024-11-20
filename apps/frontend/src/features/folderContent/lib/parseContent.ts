import { type SubFolderDTO, type FileMetadataDTO } from "@cirrodrive/schemas";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";
import { inferFileType } from "@/features/folderContent/lib/inferFileType.ts";

export const parseContent = (
  folders: SubFolderDTO[],
  files: FileMetadataDTO[],
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
    type: inferFileType(file.name),
    updatedAt: file.updatedAt,
    size: file.size,
  }));

  return [...parsedFolders, ...parsedFiles];
};
