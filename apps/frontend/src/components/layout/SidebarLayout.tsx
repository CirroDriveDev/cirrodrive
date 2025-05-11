import type React from "react";

interface SidebarLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarLayout({
  header,
  sidebar,
  children,
}: SidebarLayoutProps): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="col-span-2 row-start-1 row-end-2 flex">{header}</div>

      <div className="col-start-1 col-end-2 row-start-2 row-end-3 flex">
        {sidebar}
      </div>

      <main className="col-start-2 col-end-3 row-start-2 row-end-3 flex">
        {children}
      </main>
    </div>
  );
}
