import { downloadFileFromUrl } from "@/entities/file/lib/downloadFileFromUrl.ts";

export const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  downloadFileFromUrl({
    url,
    name: file.name,
  });
};
