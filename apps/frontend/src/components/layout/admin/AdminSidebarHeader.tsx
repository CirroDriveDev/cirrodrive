import { BaseSidebarHeader } from "#components/layout/base/BaseSidebarHeader.js";

export function AdminSidebarHeader() {
  return (
    <BaseSidebarHeader>
      <div className="flex w-full items-center justify-center">
        <div className="font-orbitron text-2xl font-bold text-foreground">
          Cirrodrive
        </div>
      </div>
    </BaseSidebarHeader>
  );
}
