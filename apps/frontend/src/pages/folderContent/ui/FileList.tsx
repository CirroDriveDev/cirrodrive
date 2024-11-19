import { type FileDTO } from "@cirrodrive/schemas";
import { FileItem } from "@/pages/folderContent/ui/FileItem.tsx";

export function FileList({ files }: { files: FileDTO[] }): JSX.Element {
  return (
    <div className="mx-auto w-[1350px] border-gray-300">
      {files.map((file) => (
        <FileItem key={file.name} file={file} />
      ))}
    </div>
  );
}
