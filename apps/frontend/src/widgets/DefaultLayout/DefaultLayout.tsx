import type React from "react";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="col-span-2 row-start-1 row-end-2 flex">
        <Header />
      </div>

      <div className="col-span-full row-start-2 row-end-3">{children}</div>
    </div>
  );
}
