import { UserCircle } from "lucide-react";
import { adminMenu } from "./adminMenu";
import { Avatar } from "#shadcn/components/Avatar.js";
import { ModeToggle } from "#shadcn/components/ModeToggle.js";
import { useAdminLogout } from "#services/admin/useAdminLogout.js";
import { SidebarTrigger } from "#shadcn/components/Sidebar.js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#shadcn/components/Breadcrumb.js";
import { Separator } from "#shadcn/components/Separator.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";

export function AdminHeader(): JSX.Element {
  const { logout } = useAdminLogout();
  const location = window.location.pathname;

  // 현재 경로에 해당하는 메뉴 항목 찾기
  const currentMenu = adminMenu.find((item) => location.startsWith(item.path));

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">관리자 페이지</BreadcrumbLink>
          </BreadcrumbItem>
          {currentMenu ?
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentMenu.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          : null}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-grow" />
      <ModeToggle />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <UserCircle className="w-full h-full" />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>프로필</DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
