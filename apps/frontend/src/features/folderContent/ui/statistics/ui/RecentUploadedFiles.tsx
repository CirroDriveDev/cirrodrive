import { useFileStore } from "@/features/folderContent/ui/statistics/model/fileStore.ts";

// 최근 업로드된 파일 목록
export function RecentUploadedFiles(): JSX.Element {
  const { recentFiles } = useFileStore(); // mock 데이터 상태 사용

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-sm">
      {/* 제목 */}
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        최근 업로드 파일
      </h3>
      {/* 파일 목록 */}
      <div className="flex flex-col gap-3">
        {recentFiles.map((file) => (
          <div
            key={file.id}
            className="rounded-md border-b border-gray-200 px-2 pb-2 last:border-b-0 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              {/* 파일 이름 */}
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {file.filename}
              </div>
              {/* 업로드 일시 / 크기 */}
              <div className="whitespace-nowrap pl-4 text-sm text-gray-600 dark:text-gray-300">
                {file.uploadedAt} / {file.size}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
