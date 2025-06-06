// AdminUserList.tsx
import { useState } from "react";
import type { AdminUserGetOutputDTO } from "@cirrodrive/schemas/admin";
import { DataTable } from "#components/ui/data-table/DataTable.js";
import {
  dataTableActionsColumn,
  dataTableIdColumn,
  dataTableTextColumn,
  dataTableDateColumn,
} from "#components/ui/data-table/DataTableColumns.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#shadcn/components/Dialog.js";
import { AdminUserEditForm } from "#components/AdminUserEditForm.js";
import { useUserDelete } from "#services/admin/useDeleteUser.js";

interface AdminUserListProps {
  users: AdminUserGetOutputDTO[];
}

export function AdminUserList({ users }: AdminUserListProps): JSX.Element {
  // DataTable내부에서 관리되는 데이터 상태 (초기값은 useUserList나 상위 컴포넌트로부터 전달받은 데이터)
  const [data, setData] = useState<AdminUserGetOutputDTO[]>(users);
  // 편집할 사용자를 위한 상태
  const [editingUser, setEditingUser] = useState<AdminUserGetOutputDTO | null>(
    null,
  );

  const { handleUserDelete } = useUserDelete();

  // 편집 액션
  const handleEdit = (user: AdminUserGetOutputDTO) => {
    setEditingUser(user);
  };

  // 삭제 액션 – API 호출 후 DataTable 데이터 상태 업데이트
  const handleDelete = (user: AdminUserGetOutputDTO) => {
    handleUserDelete(user.id);
    setData((prev) => prev.filter((u) => u.id !== user.id));
  };

  const onEditSubmit = () => {
    setEditingUser(null);
  };

  // DataTable 컬럼 정의 (각 셀은 DataTableCells.tsx 등 내부 모듈을 통해 렌더링)
  const columns = [
    dataTableIdColumn<AdminUserGetOutputDTO>(),
    dataTableTextColumn<AdminUserGetOutputDTO>({
      accessorFn: (row) => row.username,
      id: "username",
      title: "유저네임",
    }),
    dataTableTextColumn<AdminUserGetOutputDTO>({
      accessorFn: (row) => row.email,
      id: "email",
      title: "이메일",
    }),
    dataTableDateColumn<AdminUserGetOutputDTO>({
      accessorFn: (row) => row.createdAt,
      id: "createdAt",
      title: "가입일",
      formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
    }),
    dataTableTextColumn<AdminUserGetOutputDTO>({
      accessorFn: (row) => row.currentPlanId,
      id: "currentPlanId",
      title: "등급",
    }),
    dataTableActionsColumn<AdminUserGetOutputDTO>({
      title: "작업",
      actions: [
        { label: "사용자 수정", onClick: handleEdit, variant: "default" },
        { label: "계정 삭제", onClick: handleDelete, variant: "destructive" },
      ],
    }),
  ];

  return (
    <>
      <DataTable<AdminUserGetOutputDTO>
        data={data}
        columns={columns}
        features={{
          sorting: true,
          filtering: true,
          globalFilter: true,
          pagination: true,
          rowSelection: true,
        }}
        initialState={{
          pagination: { pageSize: 10 },
        }}
      />
      {editingUser ?
        <Dialog open onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사용자 수정</DialogTitle>
            </DialogHeader>
            <AdminUserEditForm
              defaultValues={editingUser}
              onSubmit={onEditSubmit}
            />
          </DialogContent>
        </Dialog>
      : null}
    </>
  );
}
