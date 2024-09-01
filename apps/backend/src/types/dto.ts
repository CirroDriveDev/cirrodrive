import { type Session } from "lucia";
import { type Prisma } from "@prisma/client";
import { type userSelect } from "@/config/userSelect.ts";

export interface UserInput {
  profileImageFileId: number | null;
  username: string;
  password: string;
  email: string;
  nickname: string;
}

export type UserOutput = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

export interface CommentInput {
  postId: number;
  authorId: number;
  content: string;
}

export type CommentOutput = Prisma.CommentGetPayload<Prisma.CommentDefaultArgs>;

export interface PostInput {
  authorId: number;
  fileId?: number;
  title: string;
  content: string;
  category: string;
}

export type PostOutput = Prisma.PostGetPayload<Prisma.PostDefaultArgs>;

export interface FileInput {
  path: string;
  originalName: string;
}

export type FileOutput = Prisma.FileGetPayload<Prisma.FileDefaultArgs>;

export interface SessionInput {
  username: string;
  password: string;
}

export type SessionOutput = Session;
