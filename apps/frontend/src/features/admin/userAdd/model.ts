import type { User } from "@/entities/user/types.ts";

export const useUserAdd = (): {
  addUser: (user: Omit<User, "id">) => void;
} => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 아직 구현되지 않음
  const addUser = (user: Omit<User, "id">): void => {
    throw new Error("Not implemented");
  };

  return {
    addUser,
  };
};
