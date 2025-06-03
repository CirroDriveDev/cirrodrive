// AdminEntryItem.tsx
import { useRef } from "react";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { EntryIcon } from "#components/EntryIcon.js";
import { useContainerDimensions } from "#hooks/useContainerDimensions";
import { formatSize } from "#utils/formatSize";
import { inferFileType } from "#utils/inferFileType";

// 이 컴포넌트는 owner 정보가 반드시 포함된 항목을 전제로 합니다.
export interface AdminEntryItemProps {
  entry: EntryDTO & {
    owner: {
      id: string;
      username?: string;
      email?: string;
      rootFolderId: string;
    };
  };
}

export function AdminEntryItem({ entry }: AdminEntryItemProps): JSX.Element {
  const { name, type, updatedAt, owner } = entry;
  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);

  const truncatedName =
    name.length > width / 8 - 4 ?
      `${name.slice(0, Math.floor(width / 8 - 4))}...`
    : name;

  const displaySize =
    type === "file" && entry.size !== null ? formatSize(entry.size) : "-";
  const iconVariant = type === "folder" ? "folder" : inferFileType(name);
  const ownerName = owner.username ?? owner.email ?? "Unknown";

  return (
    <div className="flex w-full items-center px-4 py-2">
      {/* 아이콘 영역 */}
      <div className="flex w-8 items-center justify-center">
        <EntryIcon variant={iconVariant} />
      </div>
      {/* 이름 영역 */}
      <div className="flex flex-grow items-center" ref={nameRef}>
        <div className="select-none truncate">{truncatedName}</div>
      </div>
      {/* 수정일 표시 */}
      <div className="w-52 text-nowrap">{updatedAt.toLocaleString()}</div>
      {/* 파일 크기 표시 */}
      <div className="w-20 text-right">{displaySize}</div>
      {/* 소유자 정보 표시 */}
      <div className="w-32 text-right">{ownerName}</div>
    </div>
  );
}
