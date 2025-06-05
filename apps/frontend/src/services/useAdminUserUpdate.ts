import { useMutation } from "@tanstack/react-query";
import { useTRPC, useUtils } from "#services/trpc.js";

export const useAdminUserUpdate = () => {
  const trpc = useTRPC();
  const utils = useUtils();

  const { mutate, ...rest } = useMutation({
    ...trpc.protected.user.update.mutationOptions(),
    onSuccess: () => {
      void utils.protected.user.list.invalidate();
      void utils.protected.user.get.invalidate();
    },
  });

  return {
    updateUser: mutate,
    ...rest,
  };
};
