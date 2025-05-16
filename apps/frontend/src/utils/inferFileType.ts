import type { EntryMIMEType } from "@/types/entryType.ts";

export const inferFileType = (name: string): EntryMIMEType => {
  const extension = name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
    case "svg":
      return "image";
    case "mp3":
    case "wav":
    case "flac":
    case "ogg":
    case "aac":
    case "wma":
      return "audio";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "flv":
    case "mkv":
    case "webm":
      return "video";
    case "txt":
    case "md":
    case "html":
    case "css":
    case "js":
    case "json":
    case "xml":
    case "csv":
    case "tsv":
    case "yaml":
    case "yml":
    case "toml":
    case "ini":
    case "cfg":
    case "log":
    case "pdf":
    case "hwp":
    case "pptx":
    case "docx":
    case "xlsx":
      return "text";
    case undefined: {
      throw new Error("Not implemented yet: undefined case");
    }
    default:
      return "file";
  }
};
