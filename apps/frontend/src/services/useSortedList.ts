import { useState, useMemo } from "react";

export type SortOrder = "asc" | "desc";

interface UseSortedListResult<T> {
  sortedList: T[];
  sortKey: keyof T;
  sortOrder: SortOrder;
  changeSort: (key: keyof T) => void;
}

export function useSortedList<T extends Record<string, unknown>>(
  list: T[],
  defaultKey: keyof T,
  defaultOrder: SortOrder = "asc",
): UseSortedListResult<T> {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  const sortedList = useMemo(() => {
    const copy = [...list];
    return copy.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // ✅ 타입 단언: 여기 오면 aValue, bValue는 undefined 아님
      if (sortOrder === "asc")
        return (aValue as never) > (bValue as never) ? 1 : -1;
      return (aValue as never) < (bValue as never) ? 1 : -1;
    });
  }, [list, sortKey, sortOrder]);

  const changeSort = (key: keyof T): void => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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
