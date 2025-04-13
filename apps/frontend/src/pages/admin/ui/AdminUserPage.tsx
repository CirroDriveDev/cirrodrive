import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner.tsx";
import { UserList } from "@/entities/entry/ui/UserList.tsx";
import { useUserList } from "@/entities/entry/api/useUserList.ts";

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
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <h1 className="text-xl font-semibold">사용자 목록</h1>
        </div>
        <div className="flex w-full px-4">
          {userListQuery.isLoading || !userListQuery.data ?
            <LoadingSpinner />
          : <UserList users={userListQuery.data} />}
        </div>
      </div>
    </SidebarLayout>
  );
}
