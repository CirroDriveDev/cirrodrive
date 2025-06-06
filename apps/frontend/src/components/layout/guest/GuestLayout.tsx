import { Outlet } from "react-router";
import { GuestHeader } from "#components/layout/guest/GuestHeader.js";

export function GuestLayout(): JSX.Element {
  return (
    <div className="flex h-screen">
      <div className="flex min-w-0 flex-1 flex-col">
        <GuestHeader />
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
