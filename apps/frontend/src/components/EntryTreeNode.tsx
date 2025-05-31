import type { RecursiveEntryDTO } from "@cirrodrive/schemas/entry";
import {
  ChevronDown,
  ChevronUp,
  FolderClosedIcon,
  FolderOpenIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { useUserStore } from "#store/useUserStore.js";

interface EntryTreeNodeProps {
  entry: RecursiveEntryDTO;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    entry: RecursiveEntryDTO,
  ) => void;
  isOpened?: boolean;
  highlight?: boolean;
}

export function EntryTreeNode({
  entry,
  onClick,
  isOpened,
  highlight,
}: EntryTreeNodeProps): React.ReactNode {
  const { user } = useUserStore();
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(isOpened ?? false);

  const isFolder = entry.type === "folder";
  let buttonVariant: "ghost" | "default" = "ghost";

  if (highlight && folderId === entry.id.toString()) {
    buttonVariant = "default";
  }

  if (!isFolder) {
    return null;
  }

  const sortedEntries =
    entry.entries ?
      [...entry.entries].sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <div className="flex flex-col">
      {/* 파일 */}
      <Button
        variant={buttonVariant}
        className="flex h-max justify-between space-x-2 p-1"
        onClick={(e) => {
          if (onClick) {
            onClick(e, entry);
          } else {
            void navigate(`/folder/${entry.id}`);
          }
        }}
      >
        {isOpen ?
          <FolderOpenIcon />
        : <FolderClosedIcon />}
        <span>{entry.id === user!.rootFolderId ? "내 파일" : entry.name}</span>
        <span className="flex-grow" />
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
      </Button>

      {/* 하위 엔트리 */}
      <div
        className="ml-2 flex flex-col"
        style={{
          display: isOpen && isFolder ? "block" : "none",
        }}
      >
        {sortedEntries.map((subEntry) => (
          <EntryTreeNode
            key={subEntry.id}
            entry={subEntry}
            onClick={onClick}
            highlight={highlight}
          />
        ))}
      </div>
    </div>
  );
}
