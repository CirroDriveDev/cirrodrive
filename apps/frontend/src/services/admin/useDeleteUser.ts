// ✅ useUserDelete.ts

import { useState, useCallback } from "react";
import { trpc } from "@/services/trpc.ts";

interface UseUserDelete {
  handleUserDelete: (userId: string) => void; // ✅ 여기에서만 userId 받음
  isMutatingUser: boolean;
  success: boolean | null;
}

export const useUserDelete = (): UseUserDelete => {
  const [isMutatingUser, setIsMutatingUser] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const mutation = trpc.protected.user.delete.useMutation({
    onMutate: () => {
      setIsMutatingUser(true);
      setSuccess(null);
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: () => {
      setSuccess(false);
    },
    onSettled: () => {
      setIsMutatingUser(false);
    },
  });

  const handleUserDelete = useCallback(
    (userId: string) => {
      if (isMutatingUser) return;
      mutation.mutate({ userId });
    },
    [mutation, isMutatingUser],
  );

  return {
    handleUserDelete,
    isMutatingUser,
    success,
  };
};
