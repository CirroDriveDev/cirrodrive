import { MoreVertical, Loader, DownloadIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
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
import { useTrash } from "@/entities/file/api/useTrash.ts";
import { useDownload } from "@/entities/file/api/useDownload.ts";
import { useFileRename } from "@/entities/file/api/useFileRename.ts";
import { RenameButton } from "@/features/folderContent/ui/RenameButton.tsx";

type FolderContentItemProps = FolderContent & {
  onDoubleClick?: () => void;
};

export function FolderContentItem({
  id,
  name,
  type,
  updatedAt,
  size,
  onDoubleClick,
}: FolderContentItemProps): JSX.Element {
  const displayUpdatedAt = updatedAt.toLocaleString();
  const displaySize = size ? formatSize(size) : "-";

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const { handleRename, isRenaming } = useFileRename(id);

  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);
  const truncatedName =
    name.length > width / 8 - 4 ? `${name.slice(0, width / 8 - 4)}...` : name;

  const handleRenameSubmit = (): void => {
    if (newName !== name) {
      handleRename(newName);
    }
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setNewName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter") {
      handleRenameSubmit();
    } else if (event.key === "Escape") {
      handleCancel();
    }
  };

  const { handleDownload } = useDownload(id);
  const { handleTrash } = useTrash(id);

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-gray-200"
      onDoubleClick={onDoubleClick}
    >
      <div className="flex w-8 items-center justify-center">
        <FolderContentIcon type={type} />
      </div>
      <div className="flex min-w-32 flex-grow items-center gap-2" ref={nameRef}>
        {isEditing ?
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={(e) => e.currentTarget.select()}
              disabled={isRenaming} // 이름 변경 중에는 입력 비활성화
              className="rounded border text-sm"
            />
            <button
              type="button"
              onClick={handleCancel}
              className={`text-sm ${isRenaming ? "text-gray-400" : "text-red-500"}`}
              disabled={isRenaming} // 이름 변경 중 취소 버튼 비활성화
            >
              취소
            </button>
          </div>
        : <div className="truncate">
            {isRenaming ?
              <span className="flex items-center text-sm text-gray-400">
                <Loader className="mr-2 animate-spin" size={16} />
                저장 중...
              </span>
            : truncatedName}
          </div>
        }
      </div>
      <div className="w-52 text-nowrap">{displayUpdatedAt}</div>
      <div className="w-16">{displaySize}</div>
      <div className="flex w-8 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" disabled={isRenaming}>
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {/* 첫 번째 그룹: 다운로드 */}
            <DropdownMenuGroup>
              {type !== "folder" && (
                <DropdownMenuItem onClick={handleDownload}>
                  <DownloadIcon />
                  <span>다운로드</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            {/* 두 번째 그룹: 이름 변경 */}
            <DropdownMenuGroup>
              <RenameButton
                onRename={() => {
                  setTimeout(() => {
                    setIsEditing(true);
                  }, 0);
                }}
                disabled={isRenaming}
              />
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              {type !== "folder" && (
                <DropdownMenuItem onClick={handleTrash}>
                  <Trash2 />
                  <span>휴지통</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
