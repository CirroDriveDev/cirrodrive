import { useState, useMemo } from "react";
import type { UserDTO } from "@cirrodrive/schemas";
import { UserItem } from "./UserItem.tsx";
import { useUserSearchBarStore } from "@/store/useUserSearchBarStore.ts";
import { useUserDelete } from "@/services/admin/useDeleteUser.ts";

interface UserListProps {
  users: UserDTO[];
}

type SortKey = "id" | "username" | "email" | "createdAt" | "currentPlanId";
type SortOrder = "asc" | "desc";

// searchFields 타입 정의에 currentPlanId 추가
interface SearchFields {
  id: boolean;
  username: boolean;
  email: boolean;
  createdAt: boolean;
  currentPlanId: boolean;
}

export function UserList({ users }: UserListProps): JSX.Element {
  const { searchTerm, searchFields } = useUserSearchBarStore() as {
    searchTerm: string;
    searchFields: SearchFields;
  };
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { handleUserDelete } = useUserDelete();

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (keyword === "") return true;

    const matches = [];

    if (searchFields.id) {
      matches.push(user.id.toString().includes(keyword));
    }
    if (searchFields.username) {
      matches.push(user.username.toLowerCase().includes(keyword));
    }
    if (searchFields.email) {
      matches.push(user.email.toLowerCase().includes(keyword));
    }
    if (searchFields.createdAt) {
      matches.push(user.createdAt.toLocaleDateString().includes(keyword));
    }
    if (searchFields.currentPlanId) {
      matches.push((user.currentPlanId ?? "").toLowerCase().includes(keyword));
    }

    return matches.some(Boolean);
  });

  const sortedUsers = useMemo(() => {
    const copy = [...filteredUsers];
    return copy.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ?
            aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
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
          onClick={() => handleSort("currentPlanId")}
        >
          등급 {renderArrow("currentPlanId")}
        </div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* List */}
      <div className="flex h-[720px] w-full flex-col divide-y divide-muted-foreground overflow-auto border-y border-y-muted-foreground">
        {sortedUsers.length > 0 ?
          sortedUsers.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onDelete={handleUserDelete} // ✅ 여기서 user.id를 넘기게 됨
            />
          ))
        : <div className="px-16 py-4 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        }
      </div>
    </div>
  );
}
