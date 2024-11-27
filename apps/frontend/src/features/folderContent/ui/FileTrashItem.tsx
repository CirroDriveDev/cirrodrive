import { Activity, MoreVertical, Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { formatSize } from "@/features/folderContent/lib/formatSize.ts";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";
import { FolderContentIcon } from "@/features/folderContent/ui/FolderContentIcon.tsx";
import { useContainerDimensions } from "@/shared/hooks/useContainerDimensions.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/DropdownMenu.tsx";
import { useRestore } from "@/pages/Trash/api/useRestore.ts";
import { useFileDelete } from "@/pages/Trash/api/useFileDelete.ts";
import { useFolderDelete } from "@/pages/Trash/api/useFolderDelete.ts"; // 폴더 삭제 훅 추가

type FolderContentItemProps = FolderContent & {
  onDoubleClick?: () => void;
};

export function FileTrashItem({
  id,
  name,
  type,
  updatedAt,
  size,
  onDoubleClick,
}: FolderContentItemProps): JSX.Element {
  const displayUpdatedAt = updatedAt.toLocaleString();
  const displaySize = size ? formatSize(size) : "-";

  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);
  const truncatedName =
    name.length > width / 8 - 4 ? `${name.slice(0, width / 8 - 4)}...` : name;

  const { handleTrash } = useRestore(id); // 복원하기
  const { handleFileDelete, isMutatingFile } = useFileDelete(id); // 파일 삭제하기
  const { handleFolderDelete, isMutatingFolder } = useFolderDelete(id); // 폴더 삭제하기

  const handleDelete =
    type === "folder" ? handleFolderDelete : handleFileDelete; // 삭제 함수 결정
  const isMutating = type === "folder" ? isMutatingFolder : isMutatingFile; // 진행 상태 결정
  const deleteLabel = type === "folder" ? "삭제하기" : "삭제하기"; // 버튼 라벨 결정

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-gray-200"
      onDoubleClick={onDoubleClick}
    >
      <div className="flex w-8 items-center justify-center">
        <FolderContentIcon type={type} />
      </div>
      <div className="min-w-32 flex-grow" ref={nameRef}>
        {
          /* width가 0이면 렌더링하지 않습니다. */
          !width ? "" : truncatedName
        }
      </div>
      <div className="w-52 text-nowrap">{displayUpdatedAt}</div>
      <div className="w-16">{displaySize}</div>
      <div className="flex w-8 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleTrash}>
                <Activity />
                <span>복원하기</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleDelete} disabled={isMutating}>
                <Trash2Icon />
                <span>{deleteLabel}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
