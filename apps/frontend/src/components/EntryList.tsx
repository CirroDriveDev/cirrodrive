import { useState, useMemo } from "react";
import { type EntryDTO } from "@cirrodrive/schemas/entry";
import { EntryItem } from "#components/EntryItem.js";

interface EntryListProps {
  entries: EntryDTO[];
}

type SortKey = "name" | "updatedAt" | "size";
type SortOrder = "asc" | "desc" | "none"; // ✅ 무정렬 추가

export function EntryList({ entries }: EntryListProps): JSX.Element {
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
    if (sortOrder === "none" || sortKey === null) {
      return entries;
    }

    const copy = [...entries];
    return copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      const aComp = sortKey === "updatedAt" ? new Date(aVal).getTime() : aVal;
      const bComp = sortKey === "updatedAt" ? new Date(bVal).getTime() : bVal;

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
      {/* Header */}
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
      </div>

      {/* List */}
      <div className="border-y-muted-foreground flex h-[720px] w-full flex-col divide-y-[1px] overflow-auto border-y">
        {sortedEntries.map((entry) => (
          <EntryItem
            key={`${entry.id}:${entry.name}:${entry.type}`}
            entry={entry}
          />
        ))}
      </div>
    </div>
  );
}
