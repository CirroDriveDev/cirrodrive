import type { UserDTO } from "@cirrodrive/schemas";
import { SidebarLayout } from "@/shared/ui/SidebarLayout/SidebarLayout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { UserList } from "@/entities/entry/ui/UserList.tsx";

const dummyUsers: UserDTO[] = [
  {
    id: 1,
    username: "hong",
    email: "hong@example.com",
    pricingPlan: "basic",
    usedStorage: 1024 * 1024 * 500, // 500MB
    profileImageUrl: null,
    rootFolderId: 10,
    trashFolderId: 11,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-04-01"),
  },
  {
    id: 2,
    username: "kim",
    email: "kim@example.com",
    pricingPlan: "premium",
    usedStorage: 1024 * 1024 * 2048, // 2GB
    profileImageUrl: null,
    rootFolderId: 12,
    trashFolderId: 13,
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2024-03-25"),
  },
];

export function AdminUserPage(): JSX.Element {
  return (
    <SidebarLayout header={<Header />} sidebar={<Sidebar />}>
      <div className="flex w-full flex-grow flex-col items-center">
        <div className="flex h-16 w-full items-center space-x-4 p-4">
          <h1 className="text-xl font-semibold">사용자 목록</h1>
        </div>
        <div className="flex w-full px-4">
          <UserList users={dummyUsers} />
        </div>
      </div>
    </SidebarLayout>
  );
}
