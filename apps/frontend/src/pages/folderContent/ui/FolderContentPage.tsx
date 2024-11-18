import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { fileData } from "@/pages/folderContent/ui/FileData.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import { TreeNode } from "@/pages/folderContent/ui/TreeNode.tsx";

export function FolderContentPage(): JSX.Element {
  const rootNode = fileData;

  return (
    <Layout header={<Header />}>
      <Sidebar />
      <div>
        <TreeNode node={rootNode} level={0} />
      </div>
    </Layout>
  );
}
