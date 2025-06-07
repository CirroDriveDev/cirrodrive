import { EntryBulkActionToolbar } from "#components/EntryBulkActionToolbar.js"
import type { CheckedFile } from "#components/EntryDataTable.js"

interface Props {
  checkedFileList: CheckedFile[]
  onMove: () => void
  onDelete: () => void
}

export function useEntryBulkActionBar({
  checkedFileList,
  onMove,
  onDelete,
}: Props) {
  if (checkedFileList.length === 0) return null

  return (
    <EntryBulkActionToolbar
      checkedFileList={checkedFileList}
      onMove={onMove}
      onDelete={onDelete}
    />
  )
}
