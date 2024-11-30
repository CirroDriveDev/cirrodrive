import { EntryTreeNode } from "@/entities/entry/ui/EntryTreeNode .tsx";
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
          <EntryTreeNode entry={query.data} />
        : null}
        {/* 문서 */}
        <SidebarItem label="문서" path="/documents" />
        {/* 사진 */}
        <SidebarItem label="사진" path="/photos" />
        {/* 즐겨찾기 */}
        <SidebarItem label="즐겨찾기" path="/favorites" />
        {/* 최근 파일 */}
        <SidebarItem label="최근 파일" path="/recent" />
        {/* 공유 파일 */}
        <SidebarItem label="공유 파일" path="/shared" />
        {/* 휴지통 */}
        <SidebarItem label="휴지통" path="/trash" />
      </nav>
    </aside>
  );
}
