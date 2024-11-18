import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { TreeNode } from "@/pages/folderContent/ui/TreeNode.tsx";

export function FolderContentPage(): JSX.Element {
  const rootNode = {
    id: 1,
    name: "Documents",
    size: 1024,
    children: [
      {
        id: 2,
        name: "Work",
        children: [{ id: 3, name: "Project1", size: 1024 }],
      },
      {
        id: 4,
        name: "Personal",
        children: [{ id: 5, name: "Photos", size: 5120 }],
      },
    ],
  };

  return (
    <Layout header={<Header />}>
      <Sidebar />
      <div>
        <TreeNode node={rootNode} level={0} />
      </div>
    </Layout>
  );
}
