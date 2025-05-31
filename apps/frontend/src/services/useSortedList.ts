import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc" | "none";

interface UseSortedListResult<T> {
  sortedList: T[];
  sortKey: keyof T | null;
  sortOrder: SortOrder;
  changeSort: (key: keyof T) => void;
}

/**
 * useSortedList 훅은 주어진 리스트에 대해 정렬 상태를 관리하고,
 * 정렬된 결과와 상태 변경 함수를 제공합니다.
 *
 * @param list 원본 리스트
 * @param defaultKey 초기 정렬 키
 * @param defaultOrder 초기 정렬 순서 (기본값 "asc")
 * @returns 정렬된 리스트, 정렬 상태, 정렬 변경 함수
 */
export function useSortedList<T extends Record<string, unknown>>(
  list: T[],
  defaultKey: keyof T,
  defaultOrder: SortOrder = "asc"
): UseSortedListResult<T> {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  const sortedList = useMemo(() => {
    if (!sortKey || sortOrder === "none") return list;

    const copy = [...list];
    return copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      const aComp = aVal as string | number | Date;
      const bComp = bVal as string | number | Date;

      if (typeof aComp === "string" && typeof bComp === "string") {
        return sortOrder === "asc"
          ? aComp.localeCompare(bComp)
          : bComp.localeCompare(aComp);
      }

      if (typeof aComp === "number" && typeof bComp === "number") {
        return sortOrder === "asc" ? aComp - bComp : bComp - aComp;
      }

      if (aComp instanceof Date && bComp instanceof Date) {
        return sortOrder === "asc"
          ? aComp.getTime() - bComp.getTime()
          : bComp.getTime() - aComp.getTime();
      }

      return 0;
    });
  }, [list, sortKey, sortOrder]);

  const changeSort = (key: keyof T): void => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortKey(null);
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return {
    sortedList,
    sortKey,
    sortOrder,
    changeSort,
  };
}
