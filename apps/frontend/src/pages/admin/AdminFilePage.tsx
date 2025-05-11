import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { SidebarLayout } from "@/components/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { Sidebar } from "@/components/SidebarLayout/Sidebar.tsx";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner.tsx";
import { useTempFileList } from "@/services/useTempFileList.ts";
import { useSortedList } from "@/services/useSortedList.ts";
import { AdminFileList } from "@/components/AdminFile.tsx"; // ✅ AdminFileList 사용
import { Button } from "@/shadcn/components/Button.tsx";
import { AdminFileSearchBar } from "@/components/layout/AdminFileSearchBar.tsx";

export function AdminFilePage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/login");
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
