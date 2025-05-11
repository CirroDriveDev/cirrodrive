import { SidebarItem } from "@/components/SidebarLayout/SidebarItem.tsx";

export function PublicSidebar(): JSX.Element {
  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        <SidebarItem label="업로드" path="/upload" />
        <SidebarItem label="다운로드" path="/download" />
      </nav>
    </aside>
  );
}
