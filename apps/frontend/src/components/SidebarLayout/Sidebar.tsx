import { useBoundStore } from "@/store/useBoundStore.ts";
import { PublicSidebar } from "@/components/SidebarLayout/PublicSidebar.tsx";
import { MemberSidebar } from "@/components/SidebarLayout/MemberSidebar.tsx";
import { AdminSidebar } from "@/components/SidebarLayout/AdminSidebar.tsx";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  if (user?.isAdmin) {
    return <AdminSidebar />;
  }

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
