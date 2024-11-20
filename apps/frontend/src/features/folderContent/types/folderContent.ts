export type FolderContentType =
  | "file"
  | "text"
  | "image"
  | "audio"
  | "video"
  | "folder";

export interface FolderContent {
  id: number;
  name: string;
  type: FolderContentType;
  updatedAt: Date;
  size: number | null;
}
