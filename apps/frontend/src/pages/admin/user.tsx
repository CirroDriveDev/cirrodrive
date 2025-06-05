import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { AdminUserList } from "#components/AdminUserList.js";
import { useUserList } from "#services/useUserList.js";
import { UserSearchBar } from "#components/layout/UserSearchBar.js";

export function AdminUserPage(): JSX.Element {
  const { query: userListQuery } = useUserList();

  return (
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
          <AdminUserList users={userListQuery.data ?? []} />
        : null}
      </div>
    </div>
  );
}
