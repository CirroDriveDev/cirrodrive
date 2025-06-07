import { Button } from "#shadcn/components/Button.js"
import { DownloadIcon, FolderOpen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDownloadFiles } from "#services/file/useDownloadFiles"
import type { CheckedFile } from "#components/EntryDataTable.js"

interface Props {
  checkedFileList: CheckedFile[]
  onMove: () => void
  onDelete: () => void
}

export function EntryBulkActionToolbar({
  checkedFileList,
  onMove,
  onDelete,
}: Props) {
  const { downloadFiles, isPending } = useDownloadFiles()

  const handleDownload = async () => {
    try {
      await downloadFiles({
        files: checkedFileList.map((file) => ({
          fileId: file.fileId,
          name: file.name,
        })),
        onSuccess: () => toast.success("선택한 파일 다운로드 완료"),
        onError: (errors) =>
          toast.error(`${errors.length}개의 파일 다운로드 실패`),
      })
    } catch {
      toast.error("다운로드 도중 문제가 발생했습니다.")
    }
  }

  return (
    <div className="w-full rounded-md border bg-muted px-4 py-3 flex items-center justify-between">
      <div className="text-sm font-medium">
        {checkedFileList.length}개 선택됨
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={handleDownload}
          disabled={checkedFileList.length === 0 || isPending}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          다운로드
        </Button>
        <Button
          variant="outline"
          onClick={onMove}
          disabled={checkedFileList.length === 0}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          이동
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={checkedFileList.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          삭제
        </Button>
      </div>
    </div>
  )
}
