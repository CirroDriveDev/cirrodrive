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
import { AdminSidebarHeader } from "#components/layout/admin/AdminSidebarHeader.js";
import { type MenuItem } from "#types/menuItem.js";

export function AdminSidebar({ menu }: { menu: MenuItem[] }) {
  return (
    <Sidebar>
      <AdminSidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <AdminSidebarMenuItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminSidebarMenuItem({ item }: { item: MenuItem }): JSX.Element {
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
