import { Line } from "react-chartjs-2";
import { useActivityStore } from "@/features/statistics/model/activityStore.ts";

// 최근 6개월 간의 월간 활동 그래프
export function MonthlyActivityChart(): JSX.Element {
  const { monthlyActivity } = useActivityStore();

  const data = {
    labels: monthlyActivity.map((item) => item.date),
    datasets: [
      {
        label: "신규 가입자 수",
        data: monthlyActivity.map((item) => item.newUsers),
        borderColor: "#3B82F6",
        tension: 0.3,
      },
      {
        label: "파일 업로드 수",
        data: monthlyActivity.map((item) => item.fileUploads),
        borderColor: "#F59E0B",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        월간 활동 (최근 6개월)
      </h3>
      <Line data={data} />
    </div>
  );
}
