import { useBoundStore } from "@/store/useBoundStore.ts";
import { PublicSidebar } from "@/components/layout/PublicSidebar.tsx";
import { MemberSidebar } from "@/components/layout/MemberSidebar.tsx";
import { AdminSidebar } from "@/components/layout/AdminSidebar.tsx";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  if (user?.isAdmin) {
    return <AdminSidebar />;
  }

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
