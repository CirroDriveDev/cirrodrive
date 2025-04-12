import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useActivityStore } from "../model/activityStore.ts";

// 최근 7일간 일간 활동 그래프
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function WeeklyActivityChart(): JSX.Element {
  const { weeklyActivity } = useActivityStore();

  const data = {
    labels: weeklyActivity.map((item) => item.date),
    datasets: [
      {
        label: "신규 가입자 수",
        data: weeklyActivity.map((item) => item.newUsers),
        borderColor: "#6366F1",
        tension: 0.3,
      },
      {
        label: "파일 업로드 수",
        data: weeklyActivity.map((item) => item.fileUploads),
        borderColor: "#10B981",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="h-full rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        일간 활동 (최근 7일)
      </h3>
      <Line data={data} />
    </div>
  );
}
