import {
  DownloadIcon,
  Edit2,
  Trash2,
  Activity,
  Trash2Icon,
  MoveIcon,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "#shadcn/components/DropdownMenu.js"
import { Button } from "#shadcn/components/Button.js"
import { useDownloadSingleFile } from "#services/file/useDownloadSingleFile"
import { useTrash } from "#services/file/useTrash.js"
import { useRestore } from "#services/useRestore.js"
import { useFileDelete } from "#services/useFileDelete.js"
import { useFolderDelete } from "#services/useFolderDelete.js"
import { useMoveEntry } from "#hooks/useMoveEntry.js"
import { useGetCodeByFileId } from "#services/useCreateCode.js"
import type { EntryDTO } from "@cirrodrive/schemas/entry"

interface EntryActionsDropdownProps {
  entry: EntryDTO
}

export function EntryActionsDropdown({ entry }: EntryActionsDropdownProps) {
  const { id, name, type, trashedAt } = entry

  const { downloadSingleFile } = useDownloadSingleFile()
  const { openMoveModal } = useMoveEntry(entry)
  const { get: getCode } = useGetCodeByFileId(type === "file" ? id : null)
  const { handleTrash } = useTrash(id)
  const { handleRestore } = useRestore(id)
  const { handleFileDelete } = useFileDelete(id)
  const { handleFolderDelete } = useFolderDelete(id)
  const deleteEntry = type === "folder" ? handleFolderDelete : handleFileDelete

  // 빈 함수 대체 (eslint 경고 피하기)
  const handleRename = () => {
    // TODO: 이름 변경 모달 열기
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        {!trashedAt ? (
          <DropdownMenuGroup>
            {type === "file" && (
              <DropdownMenuItem
                onClick={() => downloadSingleFile({ fileId: id, name })}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                <span>다운로드</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleRename}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>이름 변경</span>
            </DropdownMenuItem>
            {type === "file" && (
              <DropdownMenuItem onClick={getCode}>
                <Activity className="mr-2 h-4 w-4" />
                <span>코드 공유하기</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={openMoveModal}>
              <MoveIcon className="mr-2 h-4 w-4" />
              <span>이동</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTrash(type)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>휴지통</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleRestore(type)}>
              <Activity className="mr-2 h-4 w-4" />
              <span>복원하기</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteEntry}>
              <Trash2Icon className="mr-2 h-4 w-4" />
              <span>삭제하기</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
