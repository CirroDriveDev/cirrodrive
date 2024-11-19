import type React from "react";
import { FolderClosed, File, Image, MoreVertical } from "lucide-react";
import { getFiles } from "@/pages/folderContent/ui/file.tsx";

const FileBox: React.FC = () => {
  const files = getFiles(); // 파일 이름과 사이즈, 타입 읽기

  const getIcon = (type: string) => {
    //문서 타입에 따라 아이콘 바뀜
    switch (type) {
      case "image":
        return <Image size="50" />;
      case "txt":
        return <File size="50" />;
      default:
        return <FolderClosed size="50" />;
    }
  };

  return (
    <div className="mx-auto w-[1350px] border-gray-300">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex h-16 items-center justify-between border-b border-gray-200"
        >
          <div className="ml-10">{getIcon(file.type)}</div>
          <div className="">{file.name}</div>
          <div className="">{file.size}</div>
          <div className="mr-32">
            <button type="button">
              <MoreVertical />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileBox;
