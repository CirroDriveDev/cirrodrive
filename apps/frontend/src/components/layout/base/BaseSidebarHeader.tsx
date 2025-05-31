// filepath: apps/frontend/src/components/layout/base/BaseSidebarHeader.tsx
import type React from "react";

export function BaseSidebarHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="h-16 flex items-center px-4 border-b">{children}</div>;
}
