import { type FolderDTO } from "@cirrodrive/schemas";
import { FolderItem } from "@/pages/folderContent/ui/FolderItem.tsx";

interface FolderListProps {
  folders: FolderDTO[];
}

export function FolderList({ folders }: FolderListProps): JSX.Element {
  // 확장자가 없는 요소(폴더)만 필터링
  const filteredFolders = folders.filter(
    (folder) => !folder.name.includes("."),
  );

  return (
    <div className="">
      {filteredFolders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
