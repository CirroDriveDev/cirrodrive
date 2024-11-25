import { DownloadIcon, MoreVertical, Trash2 } from "lucide-react";
import { useRef } from "react";
import { formatSize } from "@/features/folderContent/lib/formatSize.ts";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";
import { FolderContentIcon } from "@/features/folderContent/ui/FolderContentIcon.tsx";
import { useContainerDimensions } from "@/shared/hooks/useContainerDimensions.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/DropdownMenu.tsx";
import { useTrash } from "@/entities/file/api/useTrash.ts";
import { useDownload } from "@/entities/file/api/useDownload.ts";

type FolderContentItemProps = FolderContent & {
  onDoubleClick?: () => void;
};

export function FolderContentItem({
  id,
  name,
  type,
  updatedAt,
  size,
  onDoubleClick,
}: FolderContentItemProps): JSX.Element {
  const displayUpdatedAt = updatedAt.toLocaleString();
  const displaySize = size ? formatSize(size) : "-";

  const nameRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerDimensions(nameRef);
  const truncatedName =
    name.length > width / 8 - 4 ? `${name.slice(0, width / 8 - 4)}...` : name;
  const { handleDownload } = useDownload(id);
  const { handleTrash } = useTrash(id);

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-gray-200"
      onDoubleClick={onDoubleClick}
    >
      <div className="flex w-8 items-center justify-center">
        <FolderContentIcon type={type} />
      </div>
      <div className="min-w-32 flex-grow" ref={nameRef}>
        {
          /* width가 0이면 렌더링하지 않습니다. */
          !width ? "" : truncatedName
        }
      </div>
      <div className="w-52 text-nowrap">{displayUpdatedAt}</div>
      <div className="w-16">{displaySize}</div>
      <div className="flex w-8 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              {type !== "folder" && (
                <DropdownMenuItem onClick={handleDownload}>
                  <DownloadIcon />
                  <span>다운로드</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              {type !== "folder" && (
                <DropdownMenuItem onClick={handleTrash}>
                  <Trash2 />
                  <span>휴지통</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
