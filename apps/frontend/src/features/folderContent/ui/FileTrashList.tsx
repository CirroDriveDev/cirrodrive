import { type SubFolderDTO, type FileMetadataDTO } from "@cirrodrive/schemas";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";
import { parseContent } from "@/features/folderContent/lib/parseContent.ts";
import { FileTrashItem } from "@/features/folderContent/ui/FileTrashItem.tsx";

interface FolderContentListProps {
  folders: SubFolderDTO[];
  files: FileMetadataDTO[];
}

export function FolderTrashList({
  folders,
  files,
}: FolderContentListProps): JSX.Element {
  // 휴지통에 있는 파일만 필터링
  const trashedFiles = files.filter((file) => file.trashedAt);

  // 필터링된 휴지통 파일과 があれば (aruba - if there are) 폴더를 결합하여 컨텐츠 배열 생성
  const folderContent: FolderContent[] = parseContent(folders, trashedFiles);

  return (
    <div className="flex w-full flex-col">
      {/* px-16 = px-4 + icon 8 + gap-x-4 */}
      <div className="flex w-full gap-x-4 px-16 py-2">
        <div className="min-w-32 flex-grow">이름</div>
        <div className="w-52">삭제된 날짜</div>
        <div className="w-16">크기</div>
      </div>
      <div className="flex w-full flex-col divide-y-[1px] divide-muted-foreground border-y-[1px] border-y-muted-foreground">
        {folderContent.map((content) => (
          <FileTrashItem
            key={`${content.id}:${content.name}:${content.type}`}
            id={content.id}
            name={content.name}
            type={content.type}
            updatedAt={content.updatedAt}
            size={content.size}
          />
        ))}
      </div>
    </div>
  );
}
