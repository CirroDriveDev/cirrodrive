import type React from "react";

interface BaseLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function BaseLayout({ header, children }: BaseLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1 min-w-0">
        {header}
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
