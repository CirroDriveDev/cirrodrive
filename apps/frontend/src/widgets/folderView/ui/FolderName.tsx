import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";

export function FolderName({
  folderId,
  folderName,
}: {
  folderId: number | null;
  folderName: string;
}): JSX.Element {
  const navigate = useNavigate();

  const navigateToFolder = (): void => {
    if (folderId === null) {
      navigate("/home");
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
