// filepath: apps/frontend/src/components/layout/base/BaseHeader.tsx
import type React from "react";

export function BaseHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex h-16 shrink-0 items-center gap-2 border-b px-4 ${className}`}
    >
      {children}
    </header>
  );
}
