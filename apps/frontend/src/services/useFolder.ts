import type { RouterOutput } from "@cirrodrive/backend";
import { trpc } from "@/services/trpc.ts";

interface UseFolder {
  data: RouterOutput["folder"]["get"] | undefined;
  isLoading: boolean;
  query: ReturnType<typeof trpc.folder.get.useQuery>;
}

export const useFolder = (folderId: string): UseFolder => {
  const query = trpc.folder.get.useQuery({ folderId });

  return {
    data: query.data,
    isLoading: query.isLoading,
    query,
  };
};
