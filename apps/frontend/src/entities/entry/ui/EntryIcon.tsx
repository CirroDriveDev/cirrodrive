import {
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderClosed,
} from "lucide-react";
import { type EntryMIMEType } from "@/entities/file/model/entryType.ts";

interface EntryIconProps {
  variant: EntryMIMEType;
}

export function EntryIcon({ variant }: EntryIconProps): JSX.Element {
  const iconMap: Record<EntryMIMEType, JSX.Element> = {
    file: <FileIcon />,
    text: <FileTextIcon />,
    image: <FileImageIcon />,
    audio: <FileAudioIcon />,
    video: <FileVideoIcon />,
    folder: <FolderClosed />,
  };

  return iconMap[variant];
}
