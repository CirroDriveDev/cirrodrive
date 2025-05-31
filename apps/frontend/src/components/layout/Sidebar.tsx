import { useBoundStore } from "#store/useBoundStore.js";
import { PublicSidebar } from "#components/layout/PublicSidebar.js";
import { MemberSidebar } from "#components/layout/MemberSidebar.js";

export function Sidebar(): JSX.Element {
  const { user } = useBoundStore();

  return user ? <MemberSidebar /> : <PublicSidebar />;
}
