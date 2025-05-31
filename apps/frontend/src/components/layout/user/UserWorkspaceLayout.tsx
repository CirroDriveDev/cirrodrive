import {
  FileIcon,
  ImageIcon,
  HistoryIcon,
  Trash2Icon,
  FolderIcon,
} from "lucide-react";
import { Outlet } from "react-router";
import { UserHeader } from "#components/layout/user/UserHeader.js";
import { UserSidebar } from "#components/layout/user/UserSidebar.js";
import { BaseSidebarLayout } from "#components/layout/base/BaseSidebarLayout.js";
import type { MenuItem } from "#types/menuItem.js";
import { useUserStore } from "#store/useUserStore.js";

export function UserWorkspaceLayout(): JSX.Element {
  const { user } = useUserStore();
  const userMenu: MenuItem[] = [
    {
      path: `/folder/${user!.rootFolderId}`,
      label: "내 파일",
      icon: FolderIcon,
    },
    {
      path: "/documents",
      label: "문서",
      icon: FileIcon,
    },
    {
      path: "/photos",
      label: "사진",
      icon: ImageIcon,
    },
    {
      path: "/recent",
      label: "최근 파일",
      icon: HistoryIcon,
    },
    {
      path: "/trash",
      label: "휴지통",
      icon: Trash2Icon,
    },
  ];

  return (
    <BaseSidebarLayout
      header={<UserHeader />}
      sidebar={<UserSidebar menu={userMenu} />}
    >
      <Outlet />
    </BaseSidebarLayout>
  );
}
