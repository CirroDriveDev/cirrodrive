import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
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

export function AdminFileView(): JSX.Element {
  const { data: files, isLoading } = trpc.protected.file.listFiles.useQuery({});
  const { deleteFile } = useAdminDeleteFile();

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

  // DataTable 컬럼 정의
  const columns = useMemo(
    () => [
      // 체크박스(행 선택) 컬럼
      dataTableSelectColumn<(typeof transformedEntries)[0]>(),
      // 파일 이름 컬럼
      dataTableTextColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => row.name,
        id: "name",
        title: "파일 이름",
      }),
      // 수정 날짜 컬럼
      dataTableDateColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => new Date(row.updatedAt),
        id: "updatedAt",
        title: "수정 날짜",
        formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
      }),
      // 파일 크기 컬럼
      dataTableTextColumn<(typeof transformedEntries)[0]>({
        accessorFn: (row) => (row.size !== null ? formatSize(row.size) : "-"),
        id: "size",
        title: "크기",
      }),
      // 액션(삭제) 컬럼
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
          pagination: {
            pageSize: 10,
          },
        }}
      />
    </div>
  );
}
