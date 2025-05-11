import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { SidebarLayout } from "@/components/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { Sidebar } from "@/components/SidebarLayout/Sidebar.tsx";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner.tsx";
import { UserList } from "@/components/UserList.tsx";
import { useUserList } from "@/services/useUserList.ts";
import { UserSearchBar } from "@/components/layout/UserSearchBar.tsx";

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
          <UserSearchBar />
        </div>
        <div className="flex w-full px-4">
          {userListQuery.isLoading ?
            <LoadingSpinner />
          : null}
          {userListQuery.isError ?
            <div className="text-red-500">
              사용자 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
            </div>
          : null}
          {(
            !userListQuery.isLoading &&
            !userListQuery.isError &&
            userListQuery.data
          ) ?
            <UserList users={userListQuery.data ?? []} />
          : null}
        </div>
      </div>
    </SidebarLayout>
  );
}
