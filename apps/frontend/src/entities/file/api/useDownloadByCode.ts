import { useEffect, useState } from "react";
import type { RouterOutput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryOptions } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";
import { parseBase64ToFile } from "@/entities/file/lib/parseBase64ToFile.ts";
import { downloadFile } from "@/entities/file/lib/downloadFile.ts";

type UseDownloadByCodeOptions = UseTRPCQueryOptions<
  RouterOutput["file"]["downloadByCode"],
  RouterOutput["file"]["downloadByCode"],
  TRPCClientErrorLike<AppRouter>
>;

interface UseDownloadByCode {
  codeString: string;
  query: ReturnType<typeof trpc.file.downloadByCode.useQuery>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
}

export const useDownloadByCode = (
  opts?: UseDownloadByCodeOptions,
): UseDownloadByCode => {
  const [codeString, setCodeString] = useState<string>("");
  const [isDownloadClicked, setIsDownloadClicked] = useState<boolean>(false);

  const query = trpc.file.downloadByCode.useQuery(
    { codeString },
    {
      ...opts,
      enabled: false,
      retry: false,
      staleTime: 0,
    },
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCodeString(e.target.value);
  };

  const handleDownload = (): void => {
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
    const file = parseBase64ToFile(query.data.encodedFile, query.data.fileName);
    downloadFile(file);
    setIsDownloadClicked(false);
  }, [query.data, query.isFetching, isDownloadClicked]);

  return {
    codeString,
    query,
    handleInputChange,
    handleDownload,
  };
};
