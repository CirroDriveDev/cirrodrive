import { useEffect, useState } from "react";
import type { RouterOutput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryOptions } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";

type UseDownloadByCodeOptions = UseTRPCQueryOptions<
  RouterOutput["file"]["download"],
  RouterOutput["file"]["download"],
  TRPCClientErrorLike<AppRouter>
>;

interface UseDownloadByCode {
  codeString: string;
  query: ReturnType<typeof trpc.file.download.useQuery>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  download: () => void;
}

export const useDownloadByCode = (
  code?: string,
  _opts?: UseDownloadByCodeOptions,
): UseDownloadByCode => {
  const [codeString, setCodeString] = useState<string>(code ?? "");
  const [isDownloadClicked, setIsDownloadClicked] = useState<boolean>(false);

  const query = trpc.file.download.useQuery({ fileId: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCodeString(e.target.value);
  };

  const download = (): void => {
    if (!codeString || codeString.length === 0 || query.isLoading) {
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
    codeString,
    query,
    handleInputChange,
    download,
  };
};
