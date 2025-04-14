import type { User } from "@/entities/user/types.ts";

export const useUserEdit = (): {
  updateUser: (id: number, updated: Omit<User, "id">) => void;
} => {
  const updateUser = (_id: number, _updated: Omit<User, "id">): void => {
    throw new Error("Not implemented");
  };

  return {
    updateUser,
  };
};
