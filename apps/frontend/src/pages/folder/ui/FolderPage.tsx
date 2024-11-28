import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { FolderView } from "@/widgets/folderView/ui/FolderView.tsx";
import { useBoundStore } from "@/shared/store/useBoundStore.ts";

interface FolderPageParams extends Record<string, string> {
  folderId: string;
}

export function FolderPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    navigate("/login");
  }

  const { data: folderId, error } = z.coerce
    .number()
    .safeParse(useParams<FolderPageParams>().folderId);

  if (error) {
    return <div>Invalid folder ID</div>;
  }

  return <FolderView folderId={folderId} />;
}
