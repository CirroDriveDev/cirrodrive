import { trpc } from "#services/trpc.js";

export function RecentUploadedFiles(): JSX.Element {
  // 새롭게 추가한 recentFiles 엔드포인트를 사용하여 최근 업로드 파일을 가져옵니다.
  const { data, isLoading, error } = trpc.protected.user.recentFiles.useQuery();

  if (isLoading) return <div>로딩 중...</div>;
  // 에러가 있거나 데이터가 없는 경우, 에러 메시지를 안전하게 보여줍니다.
  if (error || !data) {
    // 에러 객체에 안전하게 접근
    const errMsg = (error as unknown as Error)?.message ?? "데이터가 없습니다.";
    return <div>오류 발생: {errMsg}</div>;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        최근 업로드 파일
      </h3>
      <div className="flex flex-col gap-3">
        {data.map((file) => (
          <div
            key={file.id}
            className="rounded-md border-b border-gray-200 px-2 pb-2 last:border-b-0 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {file.name}
              </div>
              <div className="whitespace-nowrap pl-4 text-sm text-gray-600 dark:text-gray-300">
                {new Date(file.createdAt).toLocaleString()} / {String(file.size)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
