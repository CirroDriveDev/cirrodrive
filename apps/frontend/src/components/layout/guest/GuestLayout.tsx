import { Outlet } from "react-router";
import { GuestHeader } from "#components/layout/guest/GuestHeader.js";

export function GuestLayout(): JSX.Element {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1 min-w-0">
        <GuestHeader />
        <main className="flex-1 min-h-0 overflow-auto flex items-center justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
