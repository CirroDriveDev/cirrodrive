import { useState } from "react";
import { initialUsers } from "./dummyUsers.ts";
import type { User } from "./types.ts";

// 사용자 관리 훅
export const useUsers = (): {
  users: User[];
  getUserById: (id: number) => User | undefined;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: number, updated: Omit<User, "id">) => void;
} => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const getUserById = (id: number): User | undefined =>
    users.find((u) => u.id === id);

  const addUser = (user: Omit<User, "id">): void => {
    const newUser = { ...user, id: Date.now() };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: number, updated: Omit<User, "id">): void => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { id, ...updated } : user)),
    );
  };

  return {
    users,
    getUserById,
    addUser,
    updateUser,
  };
};
