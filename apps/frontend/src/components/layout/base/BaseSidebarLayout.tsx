import type React from "react";
import { SidebarProvider } from "#shadcn/components/Sidebar.js";

interface BaseLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function BaseSidebarLayout({
  header,
  sidebar,
  children,
}: BaseLayoutProps) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        {sidebar}
        <div className="flex flex-col flex-1 min-w-0">
          {header}
          <main className="flex-1 min-h-0 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
