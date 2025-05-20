import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend/app-router";
import { trpc } from "#services/trpc.js";

interface UseEntryList {
  query: UseTRPCQueryResult<
    RouterOutput["entry"]["list"],
    TRPCClientErrorLike<AppRouter>
  >;
}

export const useEntryList = (parentFolderId: string): UseEntryList => {
  const query = trpc.entry.list.useQuery({
    parentFolderId,
  });

  return { query };
};

export const entryListQueryKey = getQueryKey(trpc.entry.list);
