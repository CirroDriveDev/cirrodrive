import { useEffect, useState } from "react";
import type { RouterOutput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryOptions } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";

type UseDownloadOptions = UseTRPCQueryOptions<
  RouterOutput["file"]["downloadByCode"],
  RouterOutput["file"]["downloadByCode"],
  TRPCClientErrorLike<AppRouter>
>;

interface UseDownload {
  codeString: string;
  query: ReturnType<typeof trpc.file.downloadByCode.useQuery>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
}

export const useDownload = (opts?: UseDownloadOptions): UseDownload => {
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

const parseBase64ToFile = (base64: string, fileName: string): File => {
  return new File([Buffer.from(base64, "base64")], fileName);
};

// 파일 다운로드 함수
const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  downloadFileFromUrl({
    url,
    name: file.name,
  });
};

// 파일 다운로드 함수
const downloadFileFromUrl = (opts: { url: string; name: string }): void => {
  const a = document.createElement("a");
  a.href = opts.url;
  a.download = opts.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(opts.url);
};
