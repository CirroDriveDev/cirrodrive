import { useState, useMemo } from "react";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { AdminEntryItem } from "#components/AdminEntryItem.js";
import { useAdminDeleteFile } from "#services/admin/useAdminDeleteFile.js";

interface AdminEntryListProps {
  entries: (EntryDTO & {
    owner: {
      id: string;
      username?: string;
      email?: string;
      rootFolderId: string;
    };
  })[];
}

type SortKey = "name" | "updatedAt" | "size" | "owner";
type SortOrder = "asc" | "desc" | "none";

const getComparableValue = (
  entry: AdminEntryListProps["entries"][number],
  key: SortKey,
): string | number | Date | null => {
  switch (key) {
    case "name":
      return entry.name;
    case "updatedAt":
      return entry.updatedAt;
    case "size":
      return entry.type === "file" && entry.size !== null ? entry.size : 0;
    case "owner":
      return entry.owner.username ?? entry.owner.email ?? "";
    default:
      return null;
  }
};

export function AdminEntryList({ entries }: AdminEntryListProps): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const { deleteFile } = useAdminDeleteFile();

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortKey(null);
        setSortOrder("none");
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedEntries = useMemo(() => {
    if (sortOrder === "none" || sortKey === null) return entries;
    const copy = [...entries];
    return copy.sort((a, b) => {
      const aVal = getComparableValue(a, sortKey);
      const bVal = getComparableValue(b, sortKey);
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      let aComp: number | string;
      let bComp: number | string;
      if (sortKey === "updatedAt") {
        aComp = new Date(aVal as Date).getTime();
        bComp = new Date(bVal as Date).getTime();
      } else {
        aComp = aVal as number | string;
        bComp = bVal as number | string;
      }
      if (typeof aComp === "string" && typeof bComp === "string") {
        return sortOrder === "asc" ?
            aComp.localeCompare(bComp)
          : bComp.localeCompare(aComp);
      }
      if (typeof aComp === "number" && typeof bComp === "number") {
        return sortOrder === "asc" ? aComp - bComp : bComp - aComp;
      }
      return 0;
    });
  }, [entries, sortKey, sortOrder]);

  const renderArrow = (key: SortKey): "▲" | "▼" | null => {
    if (sortKey !== key || sortOrder === "none") return null;
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="flex w-full flex-col">
      {/* 헤더 영역 – 각 열 높이 h-12, 열 폭 고정 */}
      <div className="flex w-full items-center justify-between px-16 py-2 h-12 text-base font-semibold text-muted-foreground">
        <div className="w-56 cursor-pointer" onClick={() => handleSort("name")}>
          파일이름 {renderArrow("name")}
        </div>
        <div
          className="w-64 cursor-pointer text-left"
          onClick={() => handleSort("updatedAt")}
        >
          수정 날짜 {renderArrow("updatedAt")}
        </div>
        <div
          className="w-40 cursor-pointer text-left"
          onClick={() => handleSort("size")}
        >
          크기 {renderArrow("size")}
        </div>
        <div
          className="w-24 cursor-pointer text-left"
          onClick={() => handleSort("owner")}
        >
          ID {renderArrow("owner")}
        </div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* 항목 목록 */}
      <div className="flex h-[720px] w-full flex-col divide-y-[1px] overflow-auto border-y border-y-muted-foreground">
        {sortedEntries.map((entry) => (
          <AdminEntryItem
            key={`${entry.id}:${entry.name}:${entry.type}`}
            entry={entry}
            onDelete={async (id) => {
              try {
                await deleteFile(id);
              } catch {
                // 오류 처리: useAdminDeleteFile.ts에서 이미 토스트를 처리했으므로 추가 토스트 없이 넘어갑니다.
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
