import { AdminFileView } from "#components/AdminFileView.js";
import { AdminFileSearchBar } from "#components/layout/AdminFileSearchBar.js";

export function AdminFilePage(): JSX.Element {
  return (
    <div className="flex w-full flex-grow flex-col items-center">
      {/* 상단 영역: 타이틀, 검색바, 그리고 추가 버튼 */}
      <div className="flex w-full items-center justify-between px-4 py-2">
        <h1 className="text-xl font-semibold">파일 목록</h1>
        <div className="flex gap-2">
          <AdminFileSearchBar />
        </div>
      </div>

      {/* 파일 리스트 영역: AdminFileView가 내부에서 검색 조건 등을 반영한 리스트 표시 */}
      <div className="flex w-full px-4">
        <AdminFileView />
      </div>
    </div>
  );
}
