import { UserCircle } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "#shadcn/components/Avatar.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { useLogout } from "#services/useLogout.js";

export function UserAvatar(): JSX.Element {
  const { logout } = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <UserCircle className="w-full h-full" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/mypage">마이페이지</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
