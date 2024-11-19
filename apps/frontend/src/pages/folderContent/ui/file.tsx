import React from "react";
import { exampleFiles } from "@/pages/folderContent/ui/FileData.tsx";

interface FileProps {
  name: string;
  size: string;
  type: string;
}

export const getFiles = (): FileProps[] => {
  return exampleFiles.map(({ name, size, type }) => ({ name, size, type }));
};
