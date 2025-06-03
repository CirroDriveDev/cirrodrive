// AdminFileView.tsx
import { useMemo } from "react";
import { AdminEntryList } from "#components/AdminEntryList.js";
import { LoadingSpinner } from "#components/shared/LoadingSpinner.js";
import { trpc } from "#services/trpc.js";

export function AdminFileView(): JSX.Element {
  // TRPC의 protected.user.listFiles 프로시저를 사용하여 데이터를 조회합니다.
  // 빈 객체 {}를 인자로 전달하여 기본 입력값을 사용합니다.
  const { data: files, isLoading } = trpc.protected.user.listFiles.useQuery({});

  // 파일 목록 데이터에서 owner 필드가 누락되었으면 보완하고,
  // "type" 속성을 반드시 "file" 리터럴 타입으로 포함하도록 변환합니다.
  const transformedEntries = useMemo(() => {
    return (files ?? []).map((file) => ({
      ...file,
      // owner 변환: ownerId가 있으면 객체로 만들고, 없으면 기본 객체로 생성
      owner:
        file.ownerId ?
          {
            id: file.ownerId,
            // 여기는 owner 정보를 단순히 ownerId 값으로 대체합니다.
            username: file.ownerId,
            email: "", // 이메일 정보가 없다면 빈 문자열
            rootFolderId: "", // 필요한 경우 기본값 할당
          }
        : {
            id: "unknown",
            username: "Unknown",
            email: "",
            rootFolderId: "",
          },
      // type 속성 보완: 파일 목록에서는 모두 "file"로 처리합니다.
      type: "file" as const,
    }));
  }, [files]);

  if (isLoading || !files) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-bold p-4">전체 파일 목록 (관리자)</h2>
      <AdminEntryList entries={transformedEntries} />
    </div>
  );
}
