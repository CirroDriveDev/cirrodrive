import type { FileMetadataPublicDTO } from "@cirrodrive/schemas";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@cirrodrive/backend";
import { trpc } from "@/services/trpc.ts";

interface GetFileByCode {
  file: FileMetadataPublicDTO | undefined;
  error: TRPCClientErrorLike<AppRouter> | null;
  isLoading: boolean;
}

export function useGetFileByCode(code: string): GetFileByCode {
  const query = trpc.file.getByCode.useQuery(
    {
      code,
    },
    {
      enabled: Boolean(code),
      retry: false,
    },
  );

  return {
    file: query.data,
    error: query.error,
    isLoading: query.isLoading,
  };
}
