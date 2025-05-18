import { MoreVertical } from "lucide-react";
import type { UserDTO } from "@cirrodrive/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/components/DropdownMenu.tsx";

interface UserItemProps {
  user: UserDTO;
  onDelete: (id: string) => void;
}

export function UserItem({ user, onDelete }: UserItemProps): JSX.Element {
  const displayDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className="flex w-full items-center justify-between px-16 py-2 text-sm hover:bg-accent">
      <div className="w-16 shrink-0">{user.id}</div>
      <div className="w-40 truncate">{user.username}</div>
      <div className="w-64 truncate">{user.email}</div>
      <div className="w-40">{displayDate}</div>
      <div className="w-24 capitalize">{user.currentPlanId}</div>
      <div className="flex w-8 shrink-0 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => onDelete(user.id)}
                  className="w-full px-2 py-1 text-left"
                >
                  계정 삭제
                </button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
