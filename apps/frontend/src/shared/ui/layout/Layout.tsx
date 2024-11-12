import type React from "react";

interface LayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ header, children }: LayoutProps): JSX.Element {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] grid-rows-[70px_minmax(200px,_1fr)]">
      <div className="col-span-2 row-start-1 row-end-2 flex">{header}</div>

      <main className="col-span-full row-start-2 row-end-3 flex">
        {children}
      </main>
    </div>
  );
}
