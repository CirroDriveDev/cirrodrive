import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { UserList } from "@/entities/entry/ui/UserList.tsx";
import { useUserList } from "@/entities/entry/api/useUserList.ts";
import { SearchBar } from "@/shared/ui/layout/SearchBar.tsx";

export function AdminUserPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();

  // 로그인 & 관리자 권한 확인
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/login");
    }
  }, [navigate, user]);

  const { query: userListQuery } = useUserList();

  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex w-full items-center justify-between px-4 py-2">
          <h1 className="text-xl font-semibold">사용자 목록</h1>
          <SearchBar />
        </div>
        <div className="flex w-full px-4">
          {userListQuery.isLoading ? (
            <LoadingSpinner />
          ) : userListQuery.isError ? (
            <div className="text-red-500">사용자 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</div>
          ) : (
            <UserList users={userListQuery.data} />
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
