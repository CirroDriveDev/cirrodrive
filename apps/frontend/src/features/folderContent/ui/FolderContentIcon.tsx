import {
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderClosed,
} from "lucide-react";
import { type FolderContentType } from "@/features/folderContent/types/folderContent.ts";

interface FolderContentIconProps {
  type: FolderContentType;
}

export function FolderContentIcon({
  type,
}: FolderContentIconProps): JSX.Element {
  const iconMap: Record<FolderContentType, JSX.Element> = {
    file: <FileIcon />,
    text: <FileTextIcon />,
    image: <FileImageIcon />,
    audio: <FileAudioIcon />,
    video: <FileVideoIcon />,
    folder: <FolderClosed />,
  };

  return iconMap[type];
}
