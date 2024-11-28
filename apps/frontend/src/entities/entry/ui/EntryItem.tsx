import {
  MoreVertical,
  Loader,
  DownloadIcon,
  Trash2,
  Activity,
  Trash2Icon,
  Edit2,
} from "lucide-react";
import { useRef, useState } from "react";
import type { EntryDTO } from "@cirrodrive/schemas";
import { useNavigate } from "react-router-dom";
import { formatSize } from "@/entities/entry/lib/formatSize.ts";
import { EntryIcon } from "@/entities/entry/ui/EntryIcon.tsx";
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
import { inferFileType } from "@/shared/lib/inferFileType.ts";
import { useFileDelete } from "@/pages/Trash/api/useFileDelete.ts";
import { useFolderDelete } from "@/pages/Trash/api/useFolderDelete.ts";
import { useRestore } from "@/pages/Trash/api/useRestore.ts";

interface EntryItemProps {
  entry: EntryDTO;
}

export function EntryItem({ entry }: EntryItemProps): JSX.Element {
  const { id, name, type, size, trashedAt } = entry;
  const navigate = useNavigate();
  const displayUpdatedAt = entry.updatedAt.toLocaleString();
  const displaySize = size ? formatSize(size) : "-";

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const { handleRenameFile, handleRenameFolder, isRenaming } = useFileRename(
    id,
    type === "folder",
  );

  // 변수 이름 변경: newName1 -> newNameValue
  const handleRename = (newNameValue: string): void => {
    if (type === "folder") {
      handleRenameFolder(newNameValue); // 폴더 이름 변경
    } else {
      handleRenameFile(newNameValue); // 파일 이름 변경
    }
  };

  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);
  const truncatedName =
    name.length > width / 8 - 4 ? `${name.slice(0, width / 8 - 4)}...` : name;

  const handleRenameSubmit = (): void => {
    if (newName !== name) {
      handleRename(newName); // 이름 변경 처리
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

  const { handleFileDelete } = useFileDelete(id);
  const { handleFolderDelete } = useFolderDelete(id);

  const deleteEntry = type === "folder" ? handleFolderDelete : handleFileDelete;

  const { handleDownload: downloadEntry } = useDownload(id);
  const { handleTrash } = useTrash(id);
  const { restore } = useRestore(id);

  const handleDoubleClick = (): void => {
    if (type === "folder") {
      navigate(`/folder/${id}`);
    } else {
      downloadEntry();
    }
  };

  const iconVariant = type === "folder" ? type : inferFileType(name);

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-gray-200"
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex w-8 items-center justify-center">
        <EntryIcon variant={iconVariant} />
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
              disabled={isRenaming}
              className="rounded border text-sm"
            />
            <button
              type="button"
              onClick={handleCancel}
              className={`text-sm ${isRenaming ? "text-gray-400" : "text-red-500"}`}
              disabled={isRenaming}
            >
              취소
            </button>
          </div>
        : <div className="select-none truncate">
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
            {!trashedAt ?
              <DropdownMenuGroup>
                {type === "file" ?
                  <DropdownMenuItem onClick={downloadEntry}>
                    <DownloadIcon />
                    <span>다운로드</span>
                  </DropdownMenuItem>
                : null}
                <DropdownMenuItem
                  onClick={() => {
                    setTimeout(() => {
                      setIsEditing(true);
                    }, 0);
                  }}
                >
                  <Edit2 />
                  <span>이름 변경</span>
                </DropdownMenuItem>
                {type === "file" ?
                  <DropdownMenuItem onClick={() => handleTrash("file")}>
                    <Trash2 />
                    <span>휴지통</span>
                  </DropdownMenuItem>
                : null}
                {type === "folder" ?
                  <DropdownMenuItem onClick={() => handleTrash("folder")}>
                    <Trash2 />
                    <span>휴지통</span>
                  </DropdownMenuItem>
                : null}
              </DropdownMenuGroup>
            : <DropdownMenuGroup>
                <DropdownMenuItem onClick={restore}>
                  <Activity />
                  <span>복원하기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteEntry}>
                  <Trash2Icon />
                  <span>삭제하기</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
