import { Header } from "@/components/layout/Header.tsx";
import { Sidebar } from "@/components/layout/Sidebar.tsx";
import { SidebarLayout } from "@/components/layout/SidebarLayout.tsx";

// 관리자 대시보드 메인 페이지
export function MyPlanPage(): JSX.Element {
  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="w-full max-w-screen-xl space-y-6 px-6 py-4" />
      </div>
    </SidebarLayout>
  );
}
