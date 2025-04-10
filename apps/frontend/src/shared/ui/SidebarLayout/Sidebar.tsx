import { useLocation } from "react-router-dom";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { PublicSidebar } from "@/shared/ui/SidebarLayout/PublicSidebar.tsx";
import { MemberSidebar } from "@/shared/ui/SidebarLayout/MemberSidebar.tsx";
import { AdminSidebar } from "@/shared/ui/SidebarLayout/AdminSidebar.tsx";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  if (isAdminPage) {
    return <AdminSidebar />;
  }

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
