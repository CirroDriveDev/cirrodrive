import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { Button } from "#shadcn/components/Button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#shadcn/components/Dialog.js";

interface BulkDeleteDialogProps<TData> {
  table: Table<TData>;
  onBulkDelete: (selectedIds: string[]) => Promise<void>;
}

export function BulkDeleteDialog<TData>({
  table,
  onBulkDelete,
}: BulkDeleteDialogProps<TData>): JSX.Element | null {
  // 항상 Hook은 최상위에서 호출하도록 합니다.
  const [open, setOpen] = useState(false);

  const rowSelection = table.getState().rowSelection;
  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );

  // 선택된 항목이 없으면 null을 반환합니다.
  if (selectedIds.length === 0) return null;

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        선택 삭제
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                await onBulkDelete(selectedIds);
                setOpen(false);
                // 삭제 후 rowSelection을 초기화하여 "선택 삭제" 버튼이 사라지게 합니다.
                table.setRowSelection({});
              }}
            >
              삭제
            </Button>
            <Button onClick={() => setOpen(false)}>취소</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
