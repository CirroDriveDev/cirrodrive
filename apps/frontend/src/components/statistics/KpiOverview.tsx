import { trpc } from "#services/trpc.js";

export function KpiOverview(): JSX.Element {
  // TRPC를 사용해 여러 KPI 데이터를 각각 불러옵니다.
  const {
    data: totalUsersData,
    isLoading: isLoadingTotalUsers,
    error: errorTotalUsers,
  } = trpc.protected.stat.getTotalUsers.useQuery();

  const {
    data: totalFilesData,
    isLoading: isLoadingTotalFiles,
    error: errorTotalFiles,
  } = trpc.protected.stat.getTotalFiles.useQuery();

  const {
    data: todayUploadsData,
    isLoading: isLoadingTodayUploads,
    error: errorTodayUploads,
  } = trpc.protected.stat.getUploadCount.useQuery({ period: "1d" });

  const {
    data: weeklyUploadsData,
    isLoading: isLoadingWeeklyUploads,
    error: errorWeeklyUploads,
  } = trpc.protected.stat.getUploadCount.useQuery({ period: "1w" });

  const {
    data: todaySignupsData,
    isLoading: isLoadingTodaySignups,
    error: errorTodaySignups,
  } = trpc.protected.stat.getNewUsersCount.useQuery({ period: "1d" });

  const {
    data: weeklySignupsData,
    isLoading: isLoadingWeeklySignups,
    error: errorWeeklySignups,
  } = trpc.protected.stat.getNewUsersCount.useQuery({ period: "1w" });

  const {
    data: todayWithdrawalsData,
    isLoading: isLoadingTodayWithdrawals,
    error: errorTodayWithdrawals,
  } = trpc.protected.stat.listDeletedUsers.useQuery({ period: "1d" });

  const {
    data: weeklyWithdrawalsData,
    isLoading: isLoadingWeeklyWithdrawals,
    error: errorWeeklyWithdrawals,
  } = trpc.protected.stat.listDeletedUsers.useQuery({ period: "1w" });

  // 모든 쿼리가 로딩 중이면 로딩 메시지 출력
  const isLoading =
    isLoadingTotalUsers ||
    isLoadingTotalFiles ||
    isLoadingTodayUploads ||
    isLoadingWeeklyUploads ||
    isLoadingTodaySignups ||
    isLoadingWeeklySignups ||
    isLoadingTodayWithdrawals ||
    isLoadingWeeklyWithdrawals;
  if (isLoading) return <div>로딩 중...</div>;

  // 에러 처리: 쿼리에 에러가 있으면 간단한 에러 메시지 표시
  if (
    errorTotalUsers ||
    errorTotalFiles ||
    errorTodayUploads ||
    errorWeeklyUploads ||
    errorTodaySignups ||
    errorWeeklySignups ||
    errorTodayWithdrawals ||
    errorWeeklyWithdrawals
  ) {
    return <div>오류 발생</div>;
  }

  // 각 KPI는 API가 반환하는 데이터에서 값을 추출합니다.
  const totalUsers = totalUsersData?.totalUsers ?? 0;
  // 여기서 totalFiles에는 휴지통 파일도 포함되어 있습니다.
  const totalFiles = totalFilesData?.totalFiles ?? 0;
  const todayUploads = todayUploadsData?.uploads?.[0]?.count ?? 0;
  const weeklyUploads =
    weeklyUploadsData?.uploads?.reduce((acc, cur) => acc + cur.count, 0) ?? 0;
  const todaySignups = todaySignupsData?.signups?.[0]?.count ?? 0;
  const weeklySignups =
    weeklySignupsData?.signups?.reduce((acc, cur) => acc + cur.count, 0) ?? 0;
  const todayWithdrawals = todayWithdrawalsData?.deletedUsersCount ?? 0;
  const weeklyWithdrawals = weeklyWithdrawalsData?.deletedUsersCount ?? 0;

  const items = [
    { title: "총 사용자 수", value: totalUsers },
    {
      title: "총 파일 수 (휴지통 포함)",
      value: totalFiles,
    },
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
          <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
            {title}
          </div>
          <div className="text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
