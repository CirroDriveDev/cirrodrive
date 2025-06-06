import { MoreVertical } from "lucide-react";
import type { TempFile } from "#hooks/useTempFileList.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";

interface FileItemProps {
  file: TempFile;
  onDelete: (id: string) => void;
}

export function FileItem({ file, onDelete }: FileItemProps): JSX.Element {
  const displayDate = new Date(file.createdAt).toLocaleDateString();

  return (
    <div className="flex w-full items-center justify-between px-16 py-2 text-sm hover:bg-accent">
      <div className="flex-1">{file.name}</div>
      <div className="w-52">{displayDate}</div>
      <div className="w-24 text-right">
        {file.size !== null ? (Number(file.size) / 1024).toFixed(2) : "-"}
      </div>
      <div className="w-40 text-center">{file.ownerName}</div>
      <div className="w-24 text-center">{file.currentPlanId}</div>
      <div className="flex w-8 shrink-0 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onDelete(file.id)}>
                <span>파일 삭제</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
