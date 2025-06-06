import { Outlet } from "react-router";
import { UserHeader } from "#components/layout/user/UserHeader.js";
import { CommonSidebarHeader } from "#components/layout/CommonSidebarHeader.js";

export function UserLayout(): JSX.Element {
  return (
    <div className="flex h-screen">
      <div className="flex min-w-0 flex-1 flex-col">
        <CommonSidebarHeader />
        <UserHeader />
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
