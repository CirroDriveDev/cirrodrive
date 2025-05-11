import { SidebarItem } from "@/components/layout/SidebarItem.tsx";

export function AdminSidebar(): JSX.Element {
  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        <SidebarItem label="사용자" path="/admin/user" />
        <SidebarItem label="파일" path="/admin/file" />
      </nav>
    </aside>
  );
}
