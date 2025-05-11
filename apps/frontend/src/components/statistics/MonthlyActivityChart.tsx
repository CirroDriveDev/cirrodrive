import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

// API가 반환하는 신규 가입자 데이터 타입 정의
interface SignupData {
  date: string;
  count: number;
}

// API가 반환하는 파일 업로드 데이터 타입 정의
interface UploadData {
  date: string;
  count: number;
}

export function MonthlyActivityChart(): JSX.Element {
  // 신규 가입자 API 호출
  const {
    data: signupData,
    isLoading: isLoadingSignups,
    error: errorSignups,
  } = trpc.admin.getNewUsersCount.useQuery({ period: "6m" });

  // 파일 업로드 API 호출
  const {
    data: uploadData,
    isLoading: isLoadingUploads,
    error: errorUploads,
  } = trpc.admin.getUploadCount.useQuery({ period: "6m" });

  if (isLoadingSignups || isLoadingUploads) return <div>로딩 중...</div>;

  if (errorSignups || errorUploads || !signupData || !uploadData) {
    const errMsgSignups =
      (
        errorSignups &&
        typeof errorSignups === "object" &&
        "message" in errorSignups
      ) ?
        (errorSignups as { message: string }).message
      : "";
    const errMsgUploads =
      (
        errorUploads &&
        typeof errorUploads === "object" &&
        "message" in errorUploads
      ) ?
        (errorUploads as { message: string }).message
      : "";
    return (
      <div>
        오류 발생: {errMsgSignups} {errMsgUploads}
      </div>
    );
  }

  const { signups } = signupData as { signups: SignupData[] };
  const { uploads } = uploadData as { uploads: UploadData[] };

  // Chart.js 옵션: y축의 tick 옵션 설정하여 소수 부분이 표시되지 않도록 함
  const options = {
    scales: {
      y: {
        ticks: {
          // precision: 0 -> 소수점 이하 자릿수를 0으로 설정
          precision: 0,
          // 혹은 callback을 이용해 정수로 변환할 수도 있습니다.
          // callback: (value: number) => Math.round(value),
        },
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: signups.map((item) => item.date),
    datasets: [
      {
        label: "신규 가입자 수",
        data: signups.map((item) => item.count),
        borderColor: "#3B82F6",
        tension: 0.3,
      },
      {
        label: "파일 업로드 수",
        data: uploads.map((item) => item.count),
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
      <Line data={chartData} options={options} />
    </div>
  );
}
