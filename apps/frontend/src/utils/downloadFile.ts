import { downloadFileFromUrl } from "#utils/downloadFileFromUrl.js";

export const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  downloadFileFromUrl({
    url,
    name: file.name,
  });
};
