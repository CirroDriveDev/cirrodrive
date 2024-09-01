import { type Prisma } from "@prisma/client";

export const userSelect = {
  id: true,
  profileImageFileId: true,
  username: true,
  password: true,
  email: true,
  nickname: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
