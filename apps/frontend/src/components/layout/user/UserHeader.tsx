import { UserCircle } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "#shadcn/components/Avatar.js";
import { ModeToggle } from "#shadcn/components/ModeToggle.js";
import { Separator } from "#shadcn/components/Separator.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";
import { useLogout } from "#services/useLogout.js";
import { SearchBar } from "#components/layout/SearchBar.js";

export function UserHeader(): JSX.Element {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-primary">
      <SearchBar />
      <div className="flex-grow" />
      <ModeToggle />
      <HeaderSeparator />
      <UserAvatar />
    </header>
  );
}

function HeaderSeparator(): JSX.Element {
  return (
    <Separator
      orientation="vertical"
      className="data-[orientation=vertical]:h-4"
    />
  );
}

function UserAvatar(): JSX.Element {
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
          <Link to="/user/profile">마이페이지</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
