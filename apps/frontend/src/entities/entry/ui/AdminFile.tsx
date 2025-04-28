import { FileItem } from "./FileItem.tsx";
import { useSearchBarStore } from "@/shared/store/useSearchBarStore.ts";
import type { TempFile } from "@/entities/entry/api/useTempFileList.ts";
import type { SortOrder } from "@/entities/entry/api/useSortedList.ts"; // ✅ 추가

interface FileListProps {
  files: TempFile[];
  sortKey: keyof TempFile;
  sortOrder: SortOrder;
  changeSort: (key: keyof TempFile) => void;
  onDelete: (id: number) => void;
}

export function AdminFileList({
  files,
  sortKey,
  sortOrder,
  changeSort,
  onDelete,
}: FileListProps): JSX.Element {
  const { searchTerm } = useSearchBarStore();

  const filteredFiles = files.filter((file) => {
    const keyword = searchTerm.toLowerCase();
    return (
      file.name.toLowerCase().includes(keyword) ||
      file.ownerName.toLowerCase().includes(keyword) ||
      file.pricingPlan.toLowerCase().includes(keyword) ||
      new Date(file.createdAt).toLocaleDateString("ko-KR").includes(keyword)
    );
  });

  const renderArrow = (key: keyof TempFile): "▲" | "▼" | null => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-16 py-2 text-sm font-semibold text-muted-foreground">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => changeSort("name")}
        >
          파일 이름 {renderArrow("name")}
        </div>
        <div
          className="w-52 cursor-pointer"
          onClick={() => changeSort("createdAt")}
        >
          생성일 {renderArrow("createdAt")}
        </div>
        <div
          className="w-24 cursor-pointer text-right"
          onClick={() => changeSort("size")}
        >
          크기 (KB) {renderArrow("size")}
        </div>
        <div
          className="w-40 cursor-pointer text-center"
          onClick={() => changeSort("ownerName")}
        >
          유저 이름 {renderArrow("ownerName")}
        </div>
        <div
          className="w-24 cursor-pointer text-center"
          onClick={() => changeSort("pricingPlan")}
        >
          등급 {renderArrow("pricingPlan")}
        </div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* 리스트 */}
      <div className="flex h-[720px] w-full flex-col divide-y divide-muted-foreground overflow-auto border-y border-y-muted-foreground">
        {filteredFiles.length > 0 ?
          filteredFiles.map((file) => (
            <FileItem key={file.id} file={file} onDelete={onDelete} />
          ))
        : <div className="px-16 py-4 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        }
      </div>
    </div>
  );
}
