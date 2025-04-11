import type { User } from "@/entities/user/types.ts";

// 더미 데이터
export const initialUsers: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    email: "admin@example.com",
  },
  {
    id: 2,
    username: "user1",
    password: "user123",
    email: "user1@example.com",
  },
];

export const useUserView = (): {
  getUserById: (id: number) => User | undefined;
} => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 아직 구현되지 않음
  const getUserById = (id: number): User | undefined => {
    throw new Error("Not implemented");
  };

  return {
    getUserById,
  };
};
