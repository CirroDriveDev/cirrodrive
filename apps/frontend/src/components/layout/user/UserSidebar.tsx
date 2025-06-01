import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "#shadcn/components/Sidebar.js";
import { StorageStatus } from "#components/StorageStatus.js";
import type { MenuItem } from "#types/menuItem.js";
import { CommonSidebarHeader } from "#components/layout/CommonSidebarHeader.js";

export function UserSidebar({ menu }: { menu: MenuItem[] }) {
  return (
    <Sidebar>
      <CommonSidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <UserSidebarMenuItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <StorageStatus />
      </SidebarContent>
    </Sidebar>
  );
}

function UserSidebarMenuItem({ item }: { item: MenuItem }) {
  const location = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={location.pathname.startsWith(item.path)}
      >
        <Link to={item.path}>
          {item.icon ?
            <item.icon className="mr-2" />
          : null}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
