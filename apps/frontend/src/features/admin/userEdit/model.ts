import type { User } from "@/entities/user/types.ts";

export const useUserEdit = (): {
  updateUser: (id: string, updated: Omit<User, "id">) => void;
} => {
  const updateUser = (_id: string, _updated: Omit<User, "id">): void => {
    throw new Error("Not implemented");
  };

  return {
    updateUser,
  };
};
