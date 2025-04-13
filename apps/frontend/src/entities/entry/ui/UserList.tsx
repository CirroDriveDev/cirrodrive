import type { UserDTO } from "@cirrodrive/schemas";
import { UserItem } from "./UserItem.tsx";
import { useSearchBarStore } from "@/shared/store/useSearchBarStore.ts";

interface UserListProps {
  users: UserDTO[];
}

export function UserList({ users }: UserListProps): JSX.Element {
  const { searchTerm } = useSearchBarStore();

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.pricingPlan.toLowerCase().includes(keyword) ||
      user.createdAt.toLocaleDateString().includes(keyword)
    );
  });

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-16 py-2 text-sm font-semibold text-muted-foreground">
        <div className="w-16 shrink-0">ID</div>
        <div className="w-40">유저네임</div>
        <div className="w-64">이메일</div>
        <div className="w-40">가입일</div>
        <div className="w-24">등급</div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* Filtered List */}
      <div className="flex h-[720px] w-full flex-col divide-y divide-muted-foreground overflow-auto border-y border-y-muted-foreground">
        {filteredUsers.length > 0 ?
          filteredUsers.map((user) => <UserItem key={user.id} user={user} />)
        : <div className="px-16 py-4 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        }
      </div>
    </div>
  );
}
