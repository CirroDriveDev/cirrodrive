import {
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderClosed,
  FileAudioIcon,
} from "lucide-react";
import { type EntryMIMEType } from "@/types/entryType.ts";

interface EntryIconProps {
  className?: string;
  variant: EntryMIMEType;
}

const iconMap: Record<EntryMIMEType, React.ElementType> = {
  file: FileIcon,
  text: FileTextIcon,
  image: FileImageIcon,
  audio: FileAudioIcon,
  video: FileVideoIcon,
  folder: FolderClosed,
};

export function EntryIcon({ className, variant }: EntryIconProps): JSX.Element {
  const IconComponent = iconMap[variant];

  if (!IconComponent) {
    return <FileIcon />;
  }

  return <IconComponent className={className} />;
}
