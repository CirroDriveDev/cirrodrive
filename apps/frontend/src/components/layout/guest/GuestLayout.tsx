import { Outlet } from "react-router";
import { GuestHeader } from "#components/layout/guest/GuestHeader.js";
import { BaseLayout } from "#components/layout/base/BaseLayout.js";

export function GuestLayout(): JSX.Element {
  return (
    <BaseLayout header={<GuestHeader />}>
      <Outlet />
    </BaseLayout>
  );
}
