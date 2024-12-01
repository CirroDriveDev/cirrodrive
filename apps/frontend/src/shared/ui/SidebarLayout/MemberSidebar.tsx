import { FileIcon, ImageIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { EntryTreeNode } from "@/entities/entry/ui/EntryTreeNode.tsx";
import { useUserStore } from "@/shared/store/useUserStore.ts";
import { SidebarItem } from "@/shared/ui/SidebarLayout/SidebarItem.tsx";
import { useEntryGetRecursively } from "@/entities/entry/api/useEntryGetRecursively.ts";

export function MemberSidebar(): JSX.Element {
  const { user } = useUserStore();
  const { query } = useEntryGetRecursively(user!.rootFolderId);

  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        {/* 내 파일 */}
        {query.data ?
          <EntryTreeNode entry={query.data} highlight />
        : null}
        {/* 문서 */}
        <SidebarItem icon={<FileIcon />} label="문서" path="/documents" />
        {/* 사진 */}
        <SidebarItem icon={<ImageIcon />} label="사진" path="/photos" />
        {/* 최근 파일 */}
        <SidebarItem icon={<HistoryIcon />} label="최근 파일" path="/recent" />
        {/* 휴지통 */}
        <SidebarItem icon={<Trash2Icon />} label="휴지통" path="/trash" />
      </nav>
    </aside>
  );
}
