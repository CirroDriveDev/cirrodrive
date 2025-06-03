// AdminEntryList.tsx
import { useState, useMemo } from "react";
import type { EntryDTO } from "@cirrodrive/schemas/entry";
import { AdminEntryItem } from "#components/AdminEntryItem.js";

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

// 헬퍼 함수: 정렬 기준에 따라 비교할 값을 반환
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

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
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
      {/* 헤더 영역 */}
      <div className="flex w-full gap-x-4 px-16 py-2 text-sm font-semibold">
        <div
          className="min-w-32 flex-grow cursor-pointer"
          onClick={() => handleSort("name")}
        >
          이름 {renderArrow("name")}
        </div>
        <div
          className="w-52 cursor-pointer"
          onClick={() => handleSort("updatedAt")}
        >
          수정 날짜 {renderArrow("updatedAt")}
        </div>
        <div className="w-20 cursor-pointer" onClick={() => handleSort("size")}>
          크기 {renderArrow("size")}
        </div>
        <div
          className="w-32 cursor-pointer"
          onClick={() => handleSort("owner")}
        >
          소유자 {renderArrow("owner")}
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="border-y-muted-foreground flex h-[720px] w-full flex-col divide-y-[1px] overflow-auto border-y">
        {sortedEntries.map((entry) => (
          <AdminEntryItem
            key={`${entry.id}:${entry.name}:${entry.type}`}
            entry={entry}
          />
        ))}
      </div>
    </div>
  );
}
