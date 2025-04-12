import { useKpiStore } from "@/features/statistics/model/kpiStore.ts";

// KPI 카드들을 보여주는 컴포넌트
export function KpiOverview(): JSX.Element {
  const {
    totalUsers,
    totalFiles,
    todayUploads,
    weeklyUploads,
    todaySignups,
    weeklySignups,
    todayWithdrawals,
    weeklyWithdrawals,
  } = useKpiStore(); // Zustand에서 KPI 상태 불러오기

  const items = [
    { title: "총 사용자 수", value: totalUsers },
    { title: "총 파일 수", value: totalFiles },
    { title: "오늘 업로드 수", value: todayUploads },
    { title: "일주일 업로드 수", value: weeklyUploads },
    { title: "오늘 가입자 수", value: todaySignups },
    { title: "일주일 가입자 수", value: weeklySignups },
    { title: "오늘 탈퇴 수", value: todayWithdrawals },
    { title: "일주일 탈퇴 수", value: weeklyWithdrawals },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map(({ title, value }) => (
        <div
          key={title}
          className="flex flex-col justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-sm"
        >
          {/* 항목 제목 */}
          <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
            {title}
          </div>
          {/* KPI 값 (중앙 정렬) */}
          <div className="text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
