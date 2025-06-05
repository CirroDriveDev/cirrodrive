import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "#services/trpc.js";

export const useAdminUserGet = (id: string) => {
  const trpc = useTRPC();

  const { data: user, isLoading } = useQuery(
    trpc.protected.user.get.queryOptions({ userId: id }),
  );

  return {
    user,
    isLoading,
  };
};
