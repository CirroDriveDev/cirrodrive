import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Outlet } from "react-router";
import { MyPageHeader } from "#components/layout/user/MyPageHeader.js";
import { BaseSidebarLayout } from "#components/layout/base/BaseSidebarLayout.js";
import type { MenuItem } from "#types/menuItem.js";
import { UserSidebar } from "#components/layout/user/UserSidebar.js";

export function MyPageLayout(): JSX.Element {
  const mypageMenu: MenuItem[] = [
    {
      path: "/mypage/profile",
      label: "내 정보",
      icon: UserIcon,
    },
    {
      path: "/mypage/security",
      label: "보안 설정",
      icon: SettingsIcon,
    },
    {
      path: "/mypage/subscription",
      label: "내 요금제",
      icon: CreditCardIcon,
    },
    {
      path: "/mypage/payments",
      label: "결제 내역",
      icon: CreditCardIcon,
    },
    {
      path: "/mypage/plans",
      label: "요금제 변경",
      icon: CreditCardIcon,
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
