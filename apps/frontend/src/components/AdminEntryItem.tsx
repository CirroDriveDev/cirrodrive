import { useRef } from "react";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { MoreVertical } from "lucide-react";
import { EntryIcon } from "#components/EntryIcon.js";
import { useContainerDimensions } from "#hooks/useContainerDimensions";
import { formatSize } from "#utils/formatSize";
import { inferFileType } from "#utils/inferFileType";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";

export interface AdminEntryItemProps {
  entry: EntryDTO & {
    owner: {
      id: string;
      username?: string;
      email?: string;
      rootFolderId: string;
    };
  };
  onDelete: (id: string) => void;
}

export function AdminEntryItem({
  entry,
  onDelete,
}: AdminEntryItemProps): JSX.Element {
  const { name, type, updatedAt, owner, id } = entry;
  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);
  const maxChars = width ? Math.floor(width / 8) - 4 : 20;
  const truncatedName =
    name.length > maxChars ? `${name.slice(0, maxChars)}...` : name;
  const displaySize =
    type === "file" && entry.size !== null ? formatSize(entry.size) : "-";
  const iconVariant = type === "folder" ? "folder" : inferFileType(name);
  const ownerName = owner.username ?? owner.email ?? "Unknown";

  return (
    <div className="flex h-12 w-full items-center px-5 py-10 text-base">
      {/* 왼쪽 – 파일이름 영역: 아이콘 + 파일 이름, 열 폭 96 */}
      <div className="flex w-96 items-center gap-2">
        <div className="flex w-8 items-center justify-center">
          <EntryIcon variant={iconVariant} />
        </div>
        <div className="flex-1 truncate" ref={nameRef}>
          {truncatedName}
        </div>
      </div>
      {/* 중앙 – 수정 날짜 (열 폭 60) */}
      <div className="ms-4 w-60 text-left">
        {new Date(updatedAt).toLocaleString()}
      </div>
      {/* 중앙 – 파일 크기 (열 폭 44) */}
      <div className="ms-36 w-44 text-left">{displaySize}</div>
      {/* 중앙 – 소유자 (열 폭 36) */}
      <div className="ms-32 w-36 text-sm">{ownerName}</div>
      {/* 오른쪽 – 액션열: 파일 삭제 드롭다운 (열 폭 10) */}
      <div className="ms-20 w-10 shrink-0 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" title="파일 삭제">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onDelete(id)}>
                <span className="text-sm font-medium">파일 삭제</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
