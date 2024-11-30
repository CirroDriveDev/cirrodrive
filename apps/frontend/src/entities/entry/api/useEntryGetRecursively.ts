import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";

interface UseEntryGetRecursively {
  query: UseTRPCQueryResult<
    RouterOutput["entry"]["getRecursively"],
    TRPCClientErrorLike<AppRouter>
  >;
}
export const useEntryGetRecursively = (
  folderId: number,
): UseEntryGetRecursively => {
  const query = trpc.entry.getRecursively.useQuery({
    folderId,
  });

  return { query };
};

export const entryGetRecursivelyQueryKey = getQueryKey(
  trpc.entry.getRecursively,
);
