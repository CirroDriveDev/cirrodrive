import { type FileDTO } from "@cirrodrive/schemas";
import { FolderClosed, File, Image, MoreVertical } from "lucide-react";

interface FileItemProps {
  file: FileDTO;
  onClick?: () => void;
}

export function FileItem({ file, onClick }: FileItemProps): JSX.Element {
  const inferFileType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "bmp":
      case "psd":
      case "pdd":
      case "Ai":
        return "image";
      default:
        return "text";
    }
  };

  const getIcon = (type: string): JSX.Element => {
    switch (type) {
      case "image":
        return <Image size="50" />;
      case "text":
        return <File size="50" />;
      default:
        return <FolderClosed size="50" />;
    }
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200">
      <div className="ml-10">{getIcon(inferFileType(file.name))}</div>
      <div className="">{file.name}</div>
      <div className="">{file.size}</div>
      <div className="mr-32">
        <button type="button" onClick={onClick}>
          <MoreVertical />
        </button>
      </div>
    </div>
  );
}
