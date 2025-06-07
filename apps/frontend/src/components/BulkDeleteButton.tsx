// BulkDeleteButton.tsx
import { type Table } from "@tanstack/react-table";
import { Button } from "#shadcn/components/Button.js";

interface BulkDeleteButtonProps<TData> {
  table: Table<TData>;
  onBulkDelete: (selectedIds: string[]) => void;
}

export function BulkDeleteButton<TData>({
  table,
  onBulkDelete,
}: BulkDeleteButtonProps<TData>): JSX.Element {
  // table.getState().rowSelection는 선택된 행들의 상태를 담고 있는 객체입니다.
  const rowSelection = table.getState().rowSelection;
  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );
  return (
    <Button
      variant="destructive"
      onClick={() => onBulkDelete(selectedIds)}
      disabled={selectedIds.length === 0}
    >
      선택 삭제
    </Button>
  );
}
