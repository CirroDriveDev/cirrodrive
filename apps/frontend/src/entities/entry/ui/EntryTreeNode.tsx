import type { RecursiveEntryDTO } from "@cirrodrive/schemas";
import {
  ChevronDown,
  ChevronUp,
  FolderClosedIcon,
  FolderOpenIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";
import { useUserStore } from "@/shared/store/useUserStore.ts";

interface EntryTreeNodeProps {
  entry: RecursiveEntryDTO;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    entry: RecursiveEntryDTO,
  ) => void;
  isOpened?: boolean;
}

export function EntryTreeNode({
  entry,
  onClick,
  isOpened,
}: EntryTreeNodeProps): React.ReactNode {
  const { user } = useUserStore();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(isOpened ?? false);

  const isFolder = entry.type === "folder";
  if (!isFolder) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* 파일 */}
      <Button
        variant={folderId === entry.id.toString() ? "default" : "ghost"}
        className="flex h-max justify-start space-x-2 p-1"
        onClick={(e) => {
          if (onClick) {
            onClick(e, entry);
          } else {
            navigate(`/folder/${entry.id}`);
          }
        }}
      >
        <div
          className="z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ?
            <ChevronUp />
          : <ChevronDown />}
        </div>

        {isOpen ?
          <FolderOpenIcon />
        : <FolderClosedIcon />}
        <span>{entry.id === user!.rootFolderId ? "내 파일" : entry.name}</span>
      </Button>

      {/* 하위 엔트리 */}
      <div
        className="ml-2 flex flex-col"
        style={{
          display: isOpen && isFolder ? "block" : "none",
        }}
      >
        {entry.entries.map((subEntry) => (
          <EntryTreeNode key={subEntry.id} entry={subEntry} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}
