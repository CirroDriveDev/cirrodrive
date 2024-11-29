import { useNavigate } from "react-router-dom";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { FolderView } from "@/widgets/folderView/ui/FolderView.tsx";

export function DocumentsPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  return <FolderView folderId={user!.rootFolderId} type="file" />;
}
