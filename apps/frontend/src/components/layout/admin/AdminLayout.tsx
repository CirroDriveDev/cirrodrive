import { Outlet } from "react-router";
import { AdminHeader } from "#components/layout/admin/AdminHeader.js";
import { AdminSidebar } from "#components/layout/admin/AdminSidebar.js";
import { SidebarInset, SidebarProvider } from "#shadcn/components/Sidebar.js";

export function AdminLayout(): JSX.Element {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
