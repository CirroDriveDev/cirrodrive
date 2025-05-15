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
import { trpc } from "@/services/trpc.ts";

// Chart.js 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// 신규 가입자와 업로드 데이터 타입을 정의합니다.
interface SignupData {
  date: string;
  count: number;
}

interface UploadData {
  date: string;
  count: number;
}

export function WeeklyActivityChart(): JSX.Element {
  // 관리자 API를 사용하여 최근 7일간의 신규 가입자 수 데이터를 가져옵니다.
  const {
    data: signupData,
    isLoading: isLoadingSignups,
    error: errorSignups,
  } = trpc.protected.stat.getNewUsersCount.useQuery({ period: "1w" });

  // 관리자 API를 사용하여 최근 7일간의 파일 업로드 수 데이터를 가져옵니다.
  const {
    data: uploadData,
    isLoading: isLoadingUploads,
    error: errorUploads,
  } = trpc.protected.stat.getUploadCount.useQuery({ period: "1w" });

  // 두 API 호출 중 하나라도 로딩 중이면 로딩 메시지를 표시합니다.
  if (isLoadingSignups || isLoadingUploads) return <div>로딩 중...</div>;

  // 에러가 발생한 경우 각각의 오류 메시지를 합쳐서 표시합니다.
  if (errorSignups || errorUploads || !signupData || !uploadData) {
    const errMsgSignups =
      errorSignups &&
      typeof errorSignups === "object" &&
      "message" in errorSignups
        ? (errorSignups as { message: string }).message
        : "";
    const errMsgUploads =
      errorUploads &&
      typeof errorUploads === "object" &&
      "message" in errorUploads
        ? (errorUploads as { message: string }).message
        : "";
    return (
      <div>
        오류 발생: {errMsgSignups} {errMsgUploads}
      </div>
    );
  }

  // API의 반환 타입은 각각 { signups: SignupData[] }와 { uploads: UploadData[] }입니다.
  const { signups } = signupData as { signups: SignupData[] };
  const { uploads } = uploadData as { uploads: UploadData[] };

  // Chart.js 옵션을 추가합니다. y축 tick이 정수만 표시되도록 precision을 0으로 설정합니다.
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // 두 API가 동일한 날짜(label)를 반환한다고 가정, 예시로 가입자의 날짜를 x축 label로 사용합니다.
  const labels = signups.map((item) => item.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "신규 가입자 수",
        data: signups.map((item) => item.count),
        borderColor: "#6366F1",
        tension: 0.3,
      },
      {
        label: "파일 업로드 수",
        data: uploads.map((item) => item.count),
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
      <Line data={chartData} options={options} />
    </div>
  );
}
