import { useCallback, useMemo } from "react";
import { type ColumnDef, type useReactTable } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { DataTable } from "#components/ui/data-table/DataTable.js";
import { trpc } from "#services/trpc.js";
import { formatSize } from "#utils/formatSize";
import {
  dataTableSelectColumn,
  dataTableTextColumn,
  dataTableDateColumn,
  dataTableActionsColumn,
} from "#components/ui/data-table/DataTableColumns.js";
import { useAdminDeleteFile } from "#services/admin/useAdminDeleteFile.js";
import { BulkDeleteDialog } from "#components/BulkDeleteDialog.js";

export function AdminFileView(): JSX.Element {
  const { data: files, isLoading } = trpc.protected.file.listFiles.useQuery({});
  // Bulk Delete 시에는 내부 toast를 건너뛰도록 true 설정
  const { deleteFile } = useAdminDeleteFile(true);

  // 파일 데이터 변환 (소유자 정보 포함)
  const transformedEntries = useMemo(() => {
    return (files ?? []).map((file) => ({
      ...file,
      owner:
        file.ownerId ?
          {
            id: file.ownerId,
            username: file.ownerId,
            email: "",
            rootFolderId: "",
          }
        : {
            id: "unknown",
            username: "Unknown",
            email: "",
            rootFolderId: "",
          },
      type: "file" as const,
    }));
  }, [files]);

  // DataTable 컬럼 정의 (소유자 ID 컬럼 추가)
  const columns = useMemo(
    () => [
      dataTableSelectColumn<(typeof transformedEntries)[0]>(),
      dataTableTextColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => row.name,
        id: "name",
        title: "파일 이름",
      }),
      dataTableTextColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => row.owner.id,
        id: "ownerId",
        title: "소유자 ID",
      }),
      dataTableDateColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => new Date(row.updatedAt),
        id: "updatedAt",
        title: "수정 날짜",
        formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
      }),
      dataTableTextColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) =>
          row.size !== null ? formatSize(Number(row.size)) : "-",
        id: "size",
        title: "크기",
      }),
      dataTableActionsColumn<(typeof transformedEntries)[0]>({
        title: "작업",
        actions: [
          {
            label: "파일 삭제",
            onClick: (file) => {
              void deleteFile(file.id);
            },
            variant: "destructive",
          },
        ],
      }),
    ],
    [deleteFile],
  );

  const typedColumns = columns as ColumnDef<
    (typeof transformedEntries)[0],
    unknown
  >[];

  // Bulk Delete 핸들러
  const handleBulkDelete = useCallback(
    async (selectedIds: string[]) => {
      toast.dismiss();
      await Promise.allSettled(selectedIds.map((id) => deleteFile(id)));
    },
    [deleteFile],
  );

  type FileData = (typeof transformedEntries)[number];

  // extraToolbar: table의 rowSelection 상태를 매 렌더마다 확인
  // 선택된 항목이 없으면 null을 반환하여 "선택 삭제" 버튼이 나타나지 않습니다.
  const bulkToolbar = (table: ReturnType<typeof useReactTable<FileData>>) => {
    const rowSelection = table.getState().rowSelection;
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id],
    );
    if (selectedIds.length === 0) return null;
    return (
      <div className="mb-2 flex justify-end">
        <BulkDeleteDialog table={table} onBulkDelete={handleBulkDelete} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <DataTable
        data={transformedEntries}
        columns={typedColumns}
        features={{
          sorting: true,
          globalFilter: true,
          pagination: true,
          rowSelection: true,
        }}
        initialState={{
          pagination: { pageSize: 10 },
        }}
        extraToolbar={bulkToolbar}
      />
    </div>
  );
}
