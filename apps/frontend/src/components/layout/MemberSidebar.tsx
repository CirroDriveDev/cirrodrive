import { FileIcon, ImageIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { EntryTreeNode } from "#components/EntryTreeNode.js";
import { useUserStore } from "#store/useUserStore.js";
import { SidebarItem } from "#components/layout/SidebarItem.js";
import { useEntryGetRecursively } from "#services/useEntryGetRecursively.js";
import { StorageStatus } from "#components/StorageStatus.js"; // ✅ 추가

/**
 * 일반 사용자 사이드바
 * - 내 파일 트리
 * - 문서/사진/최근/휴지통 메뉴
 * - 저장소 상태
 */
export function MemberSidebar(): JSX.Element {
  const { user } = useUserStore();
  const { query } = useEntryGetRecursively(user!.rootFolderId);

  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        {/* 내 파일 */}
        {query.data ? (
          <EntryTreeNode entry={query.data} highlight />
        ) : null}

        {/* 문서 */}
        <SidebarItem icon={<FileIcon />} label="문서" path="/documents" />

        {/* 사진 */}
        <SidebarItem icon={<ImageIcon />} label="사진" path="/photos" />

        {/* 최근 파일 */}
        <SidebarItem icon={<HistoryIcon />} label="최근 파일" path="/recent" />

        {/* 휴지통 */}
        <SidebarItem icon={<Trash2Icon />} label="휴지통" path="/trash" />

        {/* 저장소 상태 표시 */}
        <div className="mt-auto pt-4 border-t border-border">
          <StorageStatus />
        </div>
      </nav>
    </aside>
  );
}
