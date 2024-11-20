import { type SubFolderDTO, type FileMetadataDTO } from "@cirrodrive/schemas";
import { FolderContentItem } from "@/features/folderContent/ui/FolderContentItem.tsx";
import { type FolderContent } from "@/features/folderContent/types/folderContent.ts";
import { parseContent } from "@/features/folderContent/lib/parseContent.ts";

interface FolderContentListProps {
  folders: SubFolderDTO[];
  files: FileMetadataDTO[];
}

export function FolderContentList({
  folders,
  files,
}: FolderContentListProps): JSX.Element {
  const folderContent: FolderContent[] = parseContent(folders, files);

  return (
    <div className="flex w-full flex-col">
      {/* px-16 = px-4 + icon 8 + gap-x-4 */}
      <div className="flex w-full gap-x-4 px-16 py-2">
        <div className="min-w-32 flex-grow">이름</div>
        <div className="w-52">수정 날짜</div>
        <div className="w-16">크기</div>
      </div>
      <div className="flex w-full flex-col divide-y-[1px] divide-muted-foreground border-y-[1px] border-y-muted-foreground">
        {folderContent.map((content) => (
          <FolderContentItem
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
