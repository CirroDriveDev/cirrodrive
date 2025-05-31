import { Outlet } from "react-router";
import { UserHeader } from "#components/layout/user/UserHeader.js";
import { UserSidebar } from "#components/layout/user/UserSidebar.js";
import { BaseSidebarLayout } from "#components/layout/base/BaseSidebarLayout.js";

export function UserLayout(): JSX.Element {
  return (
    <BaseSidebarLayout header={<UserHeader />} sidebar={<UserSidebar />}>
      <Outlet />
    </BaseSidebarLayout>
  );
}
