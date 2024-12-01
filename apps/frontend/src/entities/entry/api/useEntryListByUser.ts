import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend";
import { trpc } from "@/shared/api/trpc.ts";

interface UseEntryByUserList {
  query: UseTRPCQueryResult<
    RouterOutput["entry"]["listByUser"],
    TRPCClientErrorLike<AppRouter>
  >;
}

export const useEntryByUserList = (): UseEntryByUserList => {
  const query = trpc.entry.listByUser.useQuery();

  return { query };
};

export const entryListByUserQueryKey = getQueryKey(trpc.entry.listByUser);
