import type { User } from "#types/user.js";

export const useUserAdd = (): {
  addUser: (user: Omit<User, "id">) => void;
} => {
  const addUser = (_user: Omit<User, "id">): void => {
    throw new Error("Not implemented");
  };

  return {
    addUser,
  };
};
