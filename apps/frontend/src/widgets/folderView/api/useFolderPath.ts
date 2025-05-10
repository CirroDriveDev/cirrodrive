import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend";
import { trpc } from "@/shared/api/trpc.ts";

interface UseFolderGetPath {
  query: UseTRPCQueryResult<
    RouterOutput["folder"]["getPath"],
    TRPCClientErrorLike<AppRouter>
  >;
}

export const useFolderPath = (folderId: string): UseFolderGetPath => {
  const query = trpc.folder.getPath.useQuery({
    folderId,
  });

  return { query };
};

export const folderGetPathQueryKey = getQueryKey(trpc.folder.getPath);
