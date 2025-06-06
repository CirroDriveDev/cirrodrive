// filepath: apps/frontend/src/components/layout/base/BaseSidebarHeader.tsx
import type React from "react";
import { SidebarHeader } from "#shadcn/components/Sidebar.js";

export function BaseSidebarHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <SidebarHeader className="flex h-16 items-center border-b px-4">
      {children}
    </SidebarHeader>
  );
}
