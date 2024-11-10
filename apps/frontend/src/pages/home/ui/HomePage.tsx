import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";

export function HomePage(): JSX.Element {
  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex flex-grow items-center justify-center">
        <div>홈 페이지입니다.</div>
      </div>
    </SidebarLayout>
  );
}
