import { Layout } from "@/shared/ui/layout/Layout.tsx";
import { Header } from "@/shared/ui/layout/Header.tsx";
import { Sidebar } from "@/shared/ui/SidebarLayout/Sidebar.tsx";
import FileBox from "@/pages/folderContent/ui/FileBox.tsx";

export function Content(): JSX.Element {
  return (
    <Layout header={<Header />}>
      <Sidebar />
      <div>
        <FileBox />
      </div>
    </Layout>
  );
}
