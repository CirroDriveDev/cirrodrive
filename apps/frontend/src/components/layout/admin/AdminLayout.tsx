import { Outlet } from "react-router";
import { Home, Users, FileText } from "lucide-react";
import { type AdminMenuItem } from "#components/layout/admin/adminMenuItem.js";
import { AdminHeader } from "#components/layout/admin/AdminHeader.js";
import { AdminSidebar } from "#components/layout/admin/AdminSidebar.js";
import { BaseSidebarLayout } from "#components/layout/base/BaseSidebarLayout.js";

export const adminMenu: AdminMenuItem[] = [
  {
    path: "/admin/dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    path: "/admin/user",
    label: "사용자 관리",
    icon: Users,
  },
  {
    path: "/admin/file",
    label: "파일 관리",
    icon: FileText,
  },
] as const satisfies AdminMenuItem[];

export function AdminLayout(): JSX.Element {
  return (
    <BaseSidebarLayout
      header={<AdminHeader menu={adminMenu} />}
      sidebar={<AdminSidebar menu={adminMenu} />}
    >
      <Outlet />
    </BaseSidebarLayout>
  );
}
