import { FolderClosed, MoreVertical } from "lucide-react";
import { type FolderDTO } from "@cirrodrive/schemas"; // 폴더 데이터 타입 정의

interface FolderItemProps {
  folder: FolderDTO;
  onClick?: () => void;
}

export function FolderItem({ folder, onClick }: FolderItemProps): JSX.Element {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200">
      <div className="ml-10">
        <FolderClosed size="50" />
      </div>
      <div className="">{folder.name}</div>
      <div className="mr-32">
        <button type="button" onClick={onClick}>
          <MoreVertical />
        </button>
      </div>
    </div>
  );
}
