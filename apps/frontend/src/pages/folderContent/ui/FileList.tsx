import { type FileDTO } from "@cirrodrive/schemas";
import { FileItem } from "@/pages/folderContent/ui/FileItem.tsx";

//mx-auto w-[1350px] border-gray-300
export function FileList({ files }: { files: FileDTO[] }): JSX.Element {
  return (
    <div className="">
      {files
        .filter((file) => file.extension !== "") // extension이 빈 칸이 아닌 파일만 필터링
        .map((file) => (
          <FileItem key={file.name} file={file} />
        ))}
    </div>
  );
}
