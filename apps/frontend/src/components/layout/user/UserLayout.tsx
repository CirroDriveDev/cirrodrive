import { Outlet } from "react-router";
import { UserHeader } from "#components/layout/user/UserHeader.js";
import { CommonSidebarHeader } from "#components/layout/CommonSidebarHeader.js";

export function UserLayout(): JSX.Element {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1 min-w-0">
        <CommonSidebarHeader />
        <UserHeader />
        <main className="flex-1 min-h-0 overflow-auto flex items-center justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
