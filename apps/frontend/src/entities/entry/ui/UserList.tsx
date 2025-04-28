import { useState, useMemo } from "react";
import type { UserDTO } from "@cirrodrive/schemas";
import { UserItem } from "./UserItem.tsx";
import { useSearchBarStore } from "@/shared/store/useSearchBarStore.ts";

interface UserListProps {
  users: UserDTO[];
}

type SortKey = "id" | "username" | "email" | "createdAt" | "pricingPlan";
type SortOrder = "asc" | "desc";

export function UserList({ users }: UserListProps): JSX.Element {
  const { searchTerm } = useSearchBarStore();
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.pricingPlan.toLowerCase().includes(keyword) ||
      user.createdAt.toLocaleDateString().includes(keyword)
    );
  });

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    return copy.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredUsers, sortKey, sortOrder]);

  const renderArrow = (key: SortKey): "▲" | "▼" | null => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-16 py-2 text-sm font-semibold text-muted-foreground">
        <div
          className="w-16 shrink-0 cursor-pointer"
          onClick={() => handleSort("id")}
        >
          ID {renderArrow("id")}
        </div>
        <div
          className="w-40 cursor-pointer"
          onClick={() => handleSort("username")}
        >
          유저네임 {renderArrow("username")}
        </div>
        <div
          className="w-64 cursor-pointer"
          onClick={() => handleSort("email")}
        >
          이메일 {renderArrow("email")}
        </div>
        <div
          className="w-40 cursor-pointer"
          onClick={() => handleSort("createdAt")}
        >
          가입일 {renderArrow("createdAt")}
        </div>
        <div
          className="w-24 cursor-pointer"
          onClick={() => handleSort("pricingPlan")}
        >
          등급 {renderArrow("pricingPlan")}
        </div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* Filtered + Sorted List */}
      <div className="flex h-[720px] w-full flex-col divide-y divide-muted-foreground overflow-auto border-y border-y-muted-foreground">
        {sortedUsers.length > 0 ?
          sortedUsers.map((user) => <UserItem key={user.id} user={user} />)
        : <div className="px-16 py-4 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        }
      </div>
    </div>
  );
}
