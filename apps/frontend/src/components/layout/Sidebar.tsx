import { useBoundStore } from "#store/useBoundStore.js";
import { PublicSidebar } from "#components/layout/PublicSidebar.js";
import { MemberSidebar } from "#components/layout/MemberSidebar.js";
import { AdminSidebar } from "#components/layout/admin/AdminSidebar.js";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  if (user?.isAdmin) {
    return <AdminSidebar />;
  }

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
