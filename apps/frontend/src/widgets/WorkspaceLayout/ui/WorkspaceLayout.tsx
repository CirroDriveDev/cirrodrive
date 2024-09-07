import React from "react";
import { Header } from "@/widgets/WorkspaceLayout/ui/Header.tsx";
import { SideBar } from "@/widgets/WorkspaceLayout/ui/SideBar.tsx";
import { Main } from "@/widgets/WorkspaceLayout/ui/Main.tsx";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="col-span-2 row-start-1 row-end-2 flex">
        <Header />
      </div>

      <div className="col-start-1 col-end-2 row-start-2 row-end-3 flex">
        <SideBar />
      </div>

      <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
