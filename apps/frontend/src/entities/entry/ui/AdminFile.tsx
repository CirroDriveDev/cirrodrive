import { FileItem } from "./FileItem.tsx";
import { useAdminSearchBarStore } from "@/shared/store/useAdminSearchBarStore.ts";
import type { TempFile } from "@/entities/entry/api/useTempFileList.ts";
import type { SortOrder } from "@/entities/entry/api/useSortedList.ts";

interface AdminFileListProps {
  files: TempFile[];
  onDelete: (id: string) => void;
  sortKey: keyof TempFile;
  sortOrder: SortOrder;
  changeSort: (key: keyof TempFile) => void;
}

export function AdminFileList({
  files,
  onDelete,
  sortKey,
  sortOrder,
  changeSort,
}: AdminFileListProps): JSX.Element {
  const { searchTerms } = useAdminSearchBarStore();

  const filteredFiles = files.filter((file) => {
    const keyword = (s: string): string => s.trim().toLowerCase();
    const matches = [];

    if (searchTerms.name) {
      matches.push(file.name.toLowerCase().includes(keyword(searchTerms.name)));
    }
    if (searchTerms.ownerName) {
      matches.push(
        file.ownerName.toLowerCase().includes(keyword(searchTerms.ownerName)),
      );
    }
    if (searchTerms.pricingPlan) {
      matches.push(
        file.pricingPlan
          .toLowerCase()
          .includes(keyword(searchTerms.pricingPlan)),
      );
    }
    if (searchTerms.createdAt) {
      matches.push(
        new Date(file.createdAt)
          .toISOString()
          .startsWith(searchTerms.createdAt),
      );
    }

    if (matches.length === 0) return true;
    return matches.some(Boolean);
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
