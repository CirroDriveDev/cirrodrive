import type React from "react";

interface BaseLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function BaseLayout({ header, children }: BaseLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
