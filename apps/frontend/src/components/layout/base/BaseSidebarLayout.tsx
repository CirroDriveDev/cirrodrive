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
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <main className="min-h-0 flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
