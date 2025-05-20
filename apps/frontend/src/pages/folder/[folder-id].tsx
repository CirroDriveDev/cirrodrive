import { useNavigate, useParams } from "react-router";
import { z } from "zod";
import { FolderView } from "#components/FolderView.js";
import { useBoundStore } from "#store/useBoundStore.js";

interface FolderPageParams extends Record<string, string> {
  folderId: string;
}

export function FolderPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useBoundStore();
  if (user === null) {
    void navigate("/login");
  }

  const { data: folderId, error } = z.coerce
    .string()
    .safeParse(useParams<FolderPageParams>().folderId);

  if (error) {
    return <div>Invalid folder ID</div>;
  }

  return <FolderView folderId={folderId} />;
}
