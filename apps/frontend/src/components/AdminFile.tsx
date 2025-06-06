import { AdminFileItem } from "#components/AdminFileItem.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { useAdminSearchBarStore } from "#store/useAdminSearchBarStore.js";
import { useAdminFileList } from "#services/admin/useAdminFileList.js";
import { useAdminDeleteFile } from "#services/admin/useAdminDeleteFile.js";
import type { SortOrder } from "#services/useSortedList.js";

// Type for file with owner information from API
interface FileWithOwner {
  id: string;
  name: string;
  extension: string;
  size: bigint;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  trashedAt: Date | null;
  hash: string;
  parentFolderId: string | null;
  restoreFolderId: string | null;
  ownerId: string | null;
  owner: {
    id: string;
    username: string;
    email: string;
    currentPlanId: string;
    usedStorage: bigint;
    profileImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean;
    trialUsed: boolean;
    trashFolderId: string;
    rootFolderId: string;
  } | null;
}

interface AdminFileProps {
  sortKey: string | null;
  sortOrder: SortOrder;
  changeSort: (key: string) => void;
}

export function AdminFileList({
  sortKey,
  sortOrder,
  changeSort,
}: AdminFileProps): JSX.Element {
  const { searchTerms } = useAdminSearchBarStore();
  const { files, isLoading } = useAdminFileList();
  const { deleteFile } = useAdminDeleteFile();

  // Use files directly from API without transformation
  const apiFiles = files as FileWithOwner[];

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredFiles = apiFiles.filter((file) => {
    const keyword = (s: string): string => s.trim().toLowerCase();
    const matches = [];

    if (searchTerms.name) {
      matches.push(file.name.toLowerCase().includes(keyword(searchTerms.name)));
    }
    if (searchTerms.updatedAt) {
      matches.push(
        new Date(file.updatedAt)
          .toISOString()
          .startsWith(searchTerms.updatedAt),
      );
    }
    if (searchTerms.size) {
      const sizeKB = (Number(file.size) / 1024).toFixed(2);
      matches.push(sizeKB.includes(keyword(searchTerms.size)));
    }
    if (searchTerms.id) {
      matches.push(file.id.toLowerCase().includes(keyword(searchTerms.id)));
    }

    if (matches.length === 0) return true;
    return matches.some(Boolean);
  });

  const renderArrow = (key: string): "▲" | "▼" | null => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? "▲" : "▼";
  };

  const handleDelete = async (id: string) => {
    await deleteFile(id);
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
          onClick={() => changeSort("updatedAt")}
        >
          수정일 {renderArrow("updatedAt")}
        </div>
        <div
          className="w-24 cursor-pointer text-right"
          onClick={() => changeSort("size")}
        >
          크기 (KB) {renderArrow("size")}
        </div>
        <div
          className="w-40 cursor-pointer text-center"
          onClick={() => changeSort("updatedAt")}
        >
          수정날짜 {renderArrow("updatedAt")}
        </div>
        <div
          className="w-24 cursor-pointer text-center"
          onClick={() => changeSort("id")}
        >
          파일 ID {renderArrow("id")}
        </div>
        <div className="w-8 shrink-0 text-center">⋯</div>
      </div>

      {/* 리스트 */}
      <div className="flex h-[720px] w-full flex-col divide-y divide-muted-foreground overflow-auto border-y border-y-muted-foreground">
        {filteredFiles.length > 0 ?
          filteredFiles.map((file) => (
            <AdminFileItem key={file.id} file={file} onDelete={handleDelete} />
          ))
        : <div className="px-16 py-4 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        }
      </div>
    </div>
  );
}
