import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { PublicSidebar } from "@/shared/ui/SidebarLayout/PublicSidebar.tsx";
import { MemberSidebar } from "@/shared/ui/SidebarLayout/MemberSidebar.tsx";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  return (
    <>
      {user ?
        <MemberSidebar />
      : <PublicSidebar />}
    </>
  );
}
