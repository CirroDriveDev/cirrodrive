import { type AppRouter } from "@cirrodrive/backend/app-router";
import { type TRPCClientErrorLike } from "@trpc/client";
import { trpc } from "#services/trpc.js";

interface UseSaveToAccount {
  saveToAccount: () => void;
  isPending: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
}

export const useSaveToAccount = (code: string): UseSaveToAccount => {
  const mutation = trpc.file.saveToAccount.useMutation({});

  const saveToAccount = (): void => {
    mutation.mutate({ code });
  };

  return {
    saveToAccount,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
