import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Outlet } from "react-router";
import { MyPageHeader } from "#components/layout/user/MyPageHeader.js";
import { BaseSidebarLayout } from "#components/layout/base/BaseSidebarLayout.js";
import type { MenuItem } from "#types/menuItem.js";
import { UserSidebar } from "#components/layout/user/UserSidebar.js";

export function MyPageLayout(): JSX.Element {
  const mypageMenu: MenuItem[] = [
    {
      path: "/mypage",
      label: "마이페이지",
      icon: UserIcon,
    },
    {
      path: "/mypage/plans",
      label: "요금제",
      icon: CreditCardIcon,
    },
    {
      path: "/mypage/edit-profile",
      label: "회원 정보 수정",
      icon: SettingsIcon,
    },
  ];

  return (
    <BaseSidebarLayout
      header={<MyPageHeader />}
      sidebar={<UserSidebar menu={mypageMenu} />}
    >
      <Outlet />
    </BaseSidebarLayout>
  );
}
