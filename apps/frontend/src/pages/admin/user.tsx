import { useState } from "react";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { AdminUserList } from "#components/AdminUserList.js";
import { useUserList } from "#services/useUserList.js";
import { Button } from "#shadcn/components/Button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#shadcn/components/Dialog.js";
import { AccountCreationForm } from "#components/AccountCreationForm.js";
import { AdminAccountCreationForm } from "#components/AdminAccountCreationForm.js";

export function AdminUserPage(): JSX.Element {
  const { query } = useUserList();
  const { data: users, isLoading, isError } = query;

  const [isUserCreateDialogOpen, setIsUserCreateDialogOpen] = useState(false);
  const [isAdminCreateDialogOpen, setIsAdminCreateDialogOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !users)
    return (
      <div className="text-red-500">
        사용자 목록을 가져오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 사용자 목록</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsUserCreateDialogOpen(true)}>
            사용자 계정 생성
          </Button>
          <Button onClick={() => setIsAdminCreateDialogOpen(true)}>
            관리자 계정 생성
          </Button>
        </div>
      </div>

      {/* useUserList에서 가져온 데이터를 그대로 전달 */}
      <AdminUserList users={users} />

      <Dialog
        open={isUserCreateDialogOpen}
        onOpenChange={setIsUserCreateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 계정 생성</DialogTitle>
          </DialogHeader>
          <AccountCreationForm
            onSubmit={() => {
              // 계정 생성 후, useUserList가 자동 리패칭하도록 구성할 수 있음
              setIsUserCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAdminCreateDialogOpen}
        onOpenChange={setIsAdminCreateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 계정 생성</DialogTitle>
          </DialogHeader>
          <AdminAccountCreationForm
            onSubmit={() => {
              setIsAdminCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
