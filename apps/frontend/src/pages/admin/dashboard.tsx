import { WeeklyActivityChart } from "#components/statistics/WeeklyActivityChart.js";
import { MonthlyActivityChart } from "#components/statistics/MonthlyActivityChart.js";
import { RecentUploadedFiles } from "#components/statistics/RecentUploadedFiles.js";
import { KpiOverview } from "#components/statistics/KpiOverview.js";

// 관리자 대시보드 메인 페이지
export function AdminDashboardPage(): JSX.Element {
  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="w-full max-w-screen-xl space-y-6 px-6 py-4">
        {/* 카드 */}
        <KpiOverview />

        {/* 최근 업로드된 파일 리스트 */}
        <RecentUploadedFiles />

        {/* 일간 / 월간 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WeeklyActivityChart />
          <MonthlyActivityChart />
        </div>
      </div>
    </div>
  );
}
