import { getQueryKey, type TRPCClientErrorLike } from "@trpc/react-query";
import type { AppRouter, RouterOutput } from "@cirrodrive/backend/app-router";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { trpc } from "#services/trpc.js";

interface UseTrashEntryList {
  query: UseTRPCQueryResult<
    RouterOutput["entry"]["listTrash"],
    TRPCClientErrorLike<AppRouter>
  >;
}
export const useTrashEntryList = (): UseTrashEntryList => {
  const query = trpc.entry.listTrash.useQuery();

  return { query };
};

export const trashEntryListQueryKey = getQueryKey(trpc.entry.listTrash);
