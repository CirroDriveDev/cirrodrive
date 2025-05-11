import { useEffect, useState } from "react";
import type { RouterOutput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryOptions } from "@trpc/react-query/shared";
import { trpc } from "@/services/trpc.ts";

type UseDownloadOptions = UseTRPCQueryOptions<
  RouterOutput["file"]["download"],
  RouterOutput["file"]["download"],
  TRPCClientErrorLike<AppRouter>
>;

interface UseDownload {
  query: ReturnType<typeof trpc.file.download.useQuery>;
  handleDownload: () => void;
}

export const useDownload = (
  fileId: string,
  opts?: UseDownloadOptions,
): UseDownload => {
  const [isDownloadClicked, setIsDownloadClicked] = useState<boolean>(false);

  const query = trpc.file.download.useQuery(
    { fileId },
    {
      ...opts,
      enabled: false,
      retry: false,
      staleTime: 0,
    },
  );
  const handleDownload = (): void => {
    if (query.isLoading) {
      return;
    }
    setIsDownloadClicked(true);
    void query.refetch();
  };

  useEffect(() => {
    if (!query.data || query.isFetching || !isDownloadClicked) {
      return;
    }
    setIsDownloadClicked(false);
  }, [query.data, query.isFetching, isDownloadClicked]);

  return {
    query,
    handleDownload,
  };
};
