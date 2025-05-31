// filepath: apps/frontend/src/components/layout/base/BaseSidebarHeader.tsx
import type React from "react";
import { SidebarHeader } from "#shadcn/components/Sidebar.js";

export function BaseSidebarHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <SidebarHeader className="h-16 flex items-center px-4 border-b">
      {children}
    </SidebarHeader>
  );
}
