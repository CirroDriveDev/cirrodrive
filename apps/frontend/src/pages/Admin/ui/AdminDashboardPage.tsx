import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { RecentUploadedFiles } from "@/features/folderContent/ui/statistics/ui/RecentUploadedFiles.tsx";

// 관리자 대시보드 메인 페이지
export function AdminDashboardPage(): JSX.Element {
  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="w-full max-w-screen-xl space-y-6 px-6 py-4">
          {/* 카드 */}

          {/* 최근 업로드된 파일 리스트 */}
          <RecentUploadedFiles />

          {/* 일간 / 월간) */}
        </div>
      </div>
    </SidebarLayout>
  );
}
