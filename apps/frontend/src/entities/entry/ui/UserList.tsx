import type { UserDTO } from "@cirrodrive/schemas";
import { UserItem } from "@/entities/entry/ui/UserItem.tsx";

interface UserListProps {
  users: UserDTO[];
}

export function UserList({ users }: UserListProps): JSX.Element {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center justify-between px-16 py-2">
        <div className="w-16 shrink-0">ID</div>
        <div className="w-40">유저네임</div>
        <div className="w-64">이메일</div>
        <div className="w-40">가입일</div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      <div className="flex h-[720px] w-full flex-col divide-y-[1px] divide-muted-foreground overflow-auto border-y-[1px] border-y-muted-foreground">
        {users.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
