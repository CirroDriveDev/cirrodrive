import { Outlet } from "react-router";
import { UserHeader } from "#components/layout/user/UserHeader.js";
import { BaseLayout } from "#components/layout/base/BaseLayout.js";

export function UserLayout(): JSX.Element {
  return (
    <BaseLayout header={<UserHeader />}>
      <Outlet />
    </BaseLayout>
  );
}
