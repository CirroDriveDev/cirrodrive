import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import TreeView from "@/pages/folderContent/ui/Tree.tsx";
import fileData from "@/pages/folderContent/ui/FileData.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";

export function FolderContentPage(): JSX.Element {
  return (
    <Layout header={<Header />}>
      <Sidebar />
      <div>
        <TreeView data={fileData} />
      </div>
    </Layout>
  );
}
