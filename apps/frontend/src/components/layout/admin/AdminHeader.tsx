import { UserCircle } from "lucide-react";
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
import { BaseHeader } from "#components/layout/base/BaseHeader.js";
import { type MenuItem } from "#types/menuItem.js";

export function AdminHeader({ menu }: { menu: MenuItem[] }): JSX.Element {
  return (
    <BaseHeader>
      <SidebarTrigger className="-ml-1" />
      <HeaderSeparator />
      <AdminHeaderBreadcrumb menu={menu} />
      <div className="flex-grow" />
      <ModeToggle />
      <HeaderSeparator />
      <AdminAvatar />
    </BaseHeader>
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

function AdminHeaderBreadcrumb({ menu }: { menu: MenuItem[] }): JSX.Element {
  const location = window.location.pathname;

  // 현재 경로에 해당하는 메뉴 항목 찾기
  const currentMenu = menu.find((item) => location.startsWith(item.path));

  return (
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
  );
}

function AdminAvatar(): JSX.Element {
  const { logout } = useAdminLogout();
  return (
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
  );
}
