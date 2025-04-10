import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";

export function AdminFilePage(): JSX.Element {
  return (
    <SidebarLayout
      header={<Header />} // Pass handler to Header
      sidebar={<Sidebar />}
    >
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <div>파일 목록</div>
        </div>
      </div>
    </SidebarLayout>
  );
}
