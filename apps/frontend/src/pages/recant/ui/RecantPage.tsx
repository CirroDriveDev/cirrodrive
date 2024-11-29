import { useNavigate } from "react-router-dom";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";
import { FolderView } from "@/widgets/folderView/ui/FolderView.tsx";

export function RecentPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  // 최근 1시간 이내 수정된 파일만 표시
  return <FolderView folderId={user!.rootFolderId} recent />;
}
