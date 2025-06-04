import { useMemo } from "react";
import { AdminEntryList } from "#components/AdminEntryList.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { trpc } from "#services/trpc.js";
import { useAdminSearchBarStore } from "#store/useAdminSearchBarStore.js";
import { formatSize } from "#utils/formatSize"; // 파일 크기 포맷 함수

export function AdminFileView(): JSX.Element {
  // TRPC의 protected.user.listFiles 프로시저를 사용하여 파일 데이터를 조회합니다.
  const { data: files, isLoading } = trpc.protected.user.listFiles.useQuery({});

  // 파일 목록 데이터 변환: owner 필드를 보완하고, type을 "file"로 고정합니다.
  const transformedEntries = useMemo(() => {
    return (files ?? []).map((file) => ({
      ...file,
      owner:
        file.ownerId ?
          {
            id: file.ownerId,
            username: file.ownerId,
            email: "",
            rootFolderId: "",
          }
        : {
            id: "unknown",
            username: "Unknown",
            email: "",
            rootFolderId: "",
          },
      type: "file" as const,
    }));
  }, [files]);

  // zustand의 검색 상태를 가져옵니다.
  const { searchTerms } = useAdminSearchBarStore();

  // 검색 조건(파일이름, 수정날짜, 크기, ID)에 따라 파일 목록을 필터링합니다.
  const filteredEntries = useMemo(() => {
    return transformedEntries.filter((file) => {
      // 입력값을 소문자 및 양쪽 공백 제거한 키워드로 변환하는 함수
      const keyword = (s: string): string => s.trim().toLowerCase();
      const matches: boolean[] = [];

      // 파일이름 검색 조건 (부분 일치)
      if (searchTerms.name) {
        matches.push(
          file.name.toLowerCase().includes(keyword(searchTerms.name)),
        );
      }

      // 수정날짜 검색 조건: toLocaleString() 사용 (부분 일치)
      if (searchTerms.updatedAt) {
        const updatedAtStr = new Date(file.updatedAt).toLocaleString();
        matches.push(
          updatedAtStr.toLowerCase().includes(keyword(searchTerms.updatedAt)),
        );
      }

      // 크기 검색 조건: formatSize()를 사용하여 포맷된 문자열로 비교 (부분 일치)
      if (searchTerms.size) {
        const sizeStr = file.size !== null ? formatSize(file.size) : "";
        matches.push(sizeStr.toLowerCase().includes(keyword(searchTerms.size)));
      }

      // ID 검색 조건: **정확한 일치** (부분 검색이 아닌)
      if (searchTerms.id) {
        matches.push(file.id.toLowerCase() === keyword(searchTerms.id));
      }

      // 활성화된 모든 검색 조건이 일치해야 해당 항목이 포함됩니다.
      return matches.length === 0 ? true : matches.every(Boolean);
    });
  }, [transformedEntries, searchTerms]);

  if (isLoading || !files) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AdminEntryList entries={filteredEntries} />
    </div>
  );
}
