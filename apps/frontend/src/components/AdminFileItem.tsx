import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#shadcn/components/DropdownMenu.js";

// Type for file with owner information from API
interface FileWithOwner {
  id: string;
  name: string;
  extension: string;
  size: number;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  trashedAt: Date | null;
  hash: string;
  parentFolderId: string | null;
  restoreFolderId: string | null;
  ownerId: string | null;
  owner: {
    id: string;
    username: string;
    email: string;
    currentPlanId: string;
    usedStorage: number;
    profileImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean;
    trialUsed: boolean;
    trashFolderId: string;
    rootFolderId: string;
  } | null;
}

interface AdminFileItemProps {
  file: FileWithOwner;
  onDelete: (id: string) => void;
}

export function AdminFileItem({
  file,
  onDelete,
}: AdminFileItemProps): JSX.Element {
  const displayDate = new Date(file.updatedAt).toLocaleDateString();

  return (
    <div className="flex w-full items-center justify-between px-16 py-2 text-sm hover:bg-accent">
      <div className="flex-1">{file.name}</div>
      <div className="w-52">{displayDate}</div>
      <div className="w-24 text-right">{(file.size / 1024).toFixed(2)}</div>
      <div className="w-40 text-center">{displayDate}</div>
      <div className="w-24 text-center">{file.id.slice(0, 8)}</div>
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
