import { SidebarItem } from "@/shared/ui/SidebarLayout/SidebarItem.tsx";

export function MemberSidebar(): JSX.Element {
  return (
    <aside className="flex flex-grow bg-secondary">
      <nav className="flex flex-grow flex-col space-y-4 p-4">
        <SidebarItem label="파일" path="/home" />
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
