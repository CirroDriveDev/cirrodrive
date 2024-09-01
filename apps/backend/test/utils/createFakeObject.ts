import { Argon2id } from "oslo/password";
import {
  createFakeUserInput,
  createFakePostInput,
  createFakeCommentInput,
  createFakeFileInput,
} from "test/utils/createFakeInput.ts";
import { prisma } from "@/loaders/prisma.ts";
import {
  type UserInput,
  type UserOutput,
  type PostInput,
  type PostOutput,
  type CommentInput,
  type CommentOutput,
  type FileInput,
  type FileOutput,
} from "@/types/dto.ts";

const argon2id = new Argon2id();

export const createFakeUser = async (): Promise<{
  userInput: UserInput;
  userOutput: UserOutput;
}> => {
  const userInput = createFakeUserInput();
  const password = await argon2id.hash(userInput.password);
  const userOutput = await prisma.user.create({
    data: {
      ...userInput,
      password,
    },
  });
  return { userInput, userOutput };
};

export const createFakePost = async (): Promise<{
  userInput: UserInput;
  userOutput: UserOutput;
  postInput: PostInput;
  postOutput: PostOutput;
}> => {
  const { userInput, userOutput } = await createFakeUser();
  const postInput = createFakePostInput(userOutput.id);
  const postOutput = await prisma.post.create({ data: postInput });

  return { userInput, userOutput, postInput, postOutput };
};

export const createFakeComment = async (): Promise<{
  postInput: PostInput;
  postOutput: PostOutput;
  postUserInput: UserInput;
  postUserOutput: UserOutput;
  commentUserInput: UserInput;
  commentUserOutput: UserOutput;
  commentInput: CommentInput;
  commentOutput: CommentOutput;
}> => {
  const {
    postInput,
    postOutput,
    userInput: postUserInput,
    userOutput: postUserOutput,
  } = await createFakePost();
  const { userInput: commentUserInput, userOutput: commentUserOutput } =
    await createFakeUser();

  const commentInput = createFakeCommentInput(
    postOutput.id,
    commentUserOutput.id,
  );
  const commentOutput = await prisma.comment.create({ data: commentInput });

  return {
    postUserInput,
    postUserOutput,
    postInput,
    postOutput,
    commentUserInput,
    commentUserOutput,
    commentInput,
    commentOutput,
  };
};

export const createFakeFile = async (): Promise<{
  fileInput: FileInput;
  fileOutput: FileOutput;
}> => {
  const fileInput = createFakeFileInput();
  const fileOutput = await prisma.file.create({ data: fileInput });
  return {
    fileInput,
    fileOutput,
  };
};
