import { useNavigate } from "react-router";
import { Button } from "#shadcn/components/Button.js";
import { useUserStore } from "#store/useUserStore.js";

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
      void navigate(`/folder/${user!.rootFolderId}`);
    } else {
      void navigate(`/folder/${folderId}`);
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
