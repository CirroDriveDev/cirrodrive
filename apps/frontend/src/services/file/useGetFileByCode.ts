import type { FileMetadataPublicDTO } from "@cirrodrive/schemas/file-metadata";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@cirrodrive/backend/app-router";
import { trpc } from "#services/trpc.js";

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
