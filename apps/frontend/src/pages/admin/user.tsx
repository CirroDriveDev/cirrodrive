import { useState } from "react";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { AdminUserList } from "#components/AdminUserList.js";
import { useUserList } from "#services/useUserList.js";
import { UserSearchBar } from "#components/layout/UserSearchBar.js";
import { Button } from "#shadcn/components/Button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#shadcn/components/Dialog.js";
import { AccountCreationForm } from "#components/AccountCreationForm.js";

export function AdminUserPage(): JSX.Element {
  const { query: userListQuery } = useUserList();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 계정 생성 완료 시 다이얼로그를 닫기 위한 콜백
  const handleCreationSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex w-full flex-grow flex-col items-center">
      <div className="flex w-full items-center justify-between px-4 py-2">
        <h1 className="text-xl font-semibold">사용자 목록</h1>
        <div className="flex items-center space-x-4">
          <UserSearchBar />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            사용자 계정 생성
          </Button>
        </div>
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
          <AdminUserList users={userListQuery.data} />
        : null}
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 생성</DialogTitle>
          </DialogHeader>
          {/* onSubmit 콜백 전달: 계정 생성 성공 시 handleCreationSuccess가 호출되어 다이얼로그가 닫힘 */}
          <AccountCreationForm onSubmit={handleCreationSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
