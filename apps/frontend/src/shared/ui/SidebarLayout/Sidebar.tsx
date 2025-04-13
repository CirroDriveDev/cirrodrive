import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { PublicSidebar } from "@/shared/ui/SidebarLayout/PublicSidebar.tsx";
import { MemberSidebar } from "@/shared/ui/SidebarLayout/MemberSidebar.tsx";
import { AdminSidebar } from "@/shared/ui/SidebarLayout/AdminSidebar.tsx";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  if (user?.isAdmin) {
    return <AdminSidebar />;
  }

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
