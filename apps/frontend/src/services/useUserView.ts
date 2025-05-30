import type { User } from "#types/user.js";
// 더미 데이터
export const initialUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    email: "admin@example.com",
  },
  {
    id: "2",
    username: "user1",
    password: "user123",
    email: "user1@example.com",
  },
];

export const useUserView = (): {
  getUserById: (id: string) => User | undefined;
} => {
  const getUserById = (id: string): User | undefined => {
    return initialUsers.find((user) => user.id === id);
  };

  return {
    getUserById,
  };
};
