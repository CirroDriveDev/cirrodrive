import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useBoundStore } from "#store/useBoundStore.js";
import { SidebarLayout } from "#components/layout/SidebarLayout.js";
import { Header } from "#components/layout/Header.js";
import { Sidebar } from "#components/layout/Sidebar.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useTempFileList } from "#hooks/useTempFileList.js";
import { useSortedList } from "#services/useSortedList.js";
import { AdminFileList } from "#components/AdminFile.js"; // ✅ AdminFileList 사용
import { Button } from "#shadcn/components/Button.js";
import { AdminFileSearchBar } from "#components/layout/AdminFileSearchBar.js";

export function AdminFilePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  useEffect(() => {
    if (!user?.isAdmin) {
      void navigate("/login");
    }
  }, [navigate, user]);

  const { tempFiles, isLoading, addTempFile, deleteTempFile } =
    useTempFileList(); // ✅ deleteTempFile 추가
  const { sortedList, sortKey, sortOrder, changeSort } = useSortedList(
    tempFiles,
    "createdAt",
  );

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full items-center justify-between px-4 py-2">
          <h1 className="text-xl font-semibold">파일 목록</h1>
          <div className="flex gap-2">
            <AdminFileSearchBar />
            <Button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={addTempFile}
            >
              임시 파일 추가
            </Button>
          </div>
        </div>

        <div className="flex w-full px-4">
          {isLoading ?
            <LoadingSpinner />
          : <AdminFileList
              files={sortedList}
              sortKey={sortKey}
              sortOrder={sortOrder}
              changeSort={changeSort}
              onDelete={deleteTempFile} // ✅ 추가
            />
          }
        </div>
      </div>
    </SidebarLayout>
  );
}
