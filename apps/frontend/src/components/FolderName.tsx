import { useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/components/Button.tsx";
import { useUserStore } from "@/store/useUserStore.ts";

export function FolderName({
  folderId,
  folderName,
}: {
  folderId: string | null;
  folderName: string;
}): JSX.Element {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const navigateToFolder = (): void => {
    if (folderId === null) {
      navigate(`/folder/${user!.rootFolderId}`);
    } else {
      navigate(`/folder/${folderId}`);
    }
  };

  return (
    <Button
      className="text-lg font-bold"
      onClick={navigateToFolder}
      variant="ghost"
    >
      {folderName}
    </Button>
  );
}
