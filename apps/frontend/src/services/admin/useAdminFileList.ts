import { trpc } from "#services/trpc";

export function useAdminFileList() {
  const { data, isLoading, error, refetch } = trpc.protected.file.listFiles.useQuery({
    limit: 100,
    offset: 0,
    sortBy: "uploadDate",
    order: "desc",
  });

  // API 응답을 그대로 반환 (owner 정보 포함)
  return {
    files: data ?? [],
    isLoading,
    error,
    refetch,
  };
}