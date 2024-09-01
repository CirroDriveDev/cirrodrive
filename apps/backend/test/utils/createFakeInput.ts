import { faker } from "@faker-js/faker";
import {
  type UserInput,
  type PostInput,
  type CommentInput,
  type FileInput,
} from "@/types/dto.ts";

export const createFakeUserInput = (fileId?: number): UserInput => {
  return {
    profileImageFileId: fileId ?? null,
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    nickname: faker.internet.displayName(),
  };
};

export const createFakePostInput = (
  authorId: number,
  fileId?: number,
): PostInput => ({
  authorId,
  fileId,
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraph(),
  category: faker.lorem.word(),
});

export const createFakeCommentInput = (
  postId: number,
  userId: number,
): CommentInput => ({
  postId,
  authorId: userId,
  content: faker.lorem.sentence(),
});

export const createFakeFileInput = (): FileInput => {
  return {
    path: faker.system.filePath(),
    originalName: faker.system.fileName(),
  };
};
