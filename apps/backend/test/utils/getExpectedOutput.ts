import {
  type CommentInput,
  type CommentOutput,
  type FileInput,
  type FileOutput,
  type PostInput,
  type PostOutput,
  type SessionOutput,
  type UserInput,
  type UserOutput,
} from "@/types/dto.ts";

export const getExpectedUserOutput = (userInput: UserInput): UserOutput => {
  const expectedUser = {
    id: expect.any(Number) as number, // ID는 자동 생성되므로, ID를 비교하지 않는다.
    profileImageFileId: userInput.profileImageFileId,
    username: userInput.username,
    password: expect.any(String) as string, // 비밀번호는 암호화되어 반환되므로, 비밀번호를 비교하지 않는다.
    email: userInput.email,
    nickname: userInput.nickname,
    createdAt: expect.any(Date) as Date, // 생성일자는 자동 생성되므로, 생성일자를 비교하지 않는다.
    updatedAt: expect.any(Date) as Date, // 수정일자는 자동 생성되므로, 수정일자를 비교하지 않는다.
  };
  return expectedUser;
};

export const getExpectedPostOutput = (postInput: PostInput): PostOutput => {
  const expectedPost = {
    id: expect.any(Number) as number, // ID는 자동 생성되므로, ID를 비교하지 않는다.
    authorId: postInput.authorId,
    fileId: postInput.fileId ?? null,
    title: postInput.title,
    content: postInput.content,
    viewCount: 0,
    category: postInput.category,
    createdAt: expect.any(Date) as Date, // 생성일자는 자동 생성되므로, 생성일자를 비교하지 않는다.
    updatedAt: expect.any(Date) as Date, // 수정일자는 자동 생성되므로, 수정일자를 비교하지 않는다.
  };
  return expectedPost;
};

export const getExpectedCommentOutput = (
  commentInput: CommentInput,
): CommentOutput => {
  const expectedComment = {
    id: expect.any(Number) as number, // ID는 자동 생성되므로, ID를 비교하지 않는다.
    postId: commentInput.postId,
    authorId: commentInput.authorId,
    content: commentInput.content,
    createdAt: expect.any(Date) as Date, // 생성일자는 자동 생성되므로, 생성일자를 비교하지 않는다.
    updatedAt: expect.any(Date) as Date, // 수정일자는 자동 생성되므로, 수정일자를 비교하지 않는다.
  };
  return expectedComment;
};

export const getExpectedFileOutput = (fileInput: FileInput): FileOutput => {
  return {
    id: expect.any(Number) as number, // ID는 자동 생성되므로, ID를 비교하지 않는다.
    path: fileInput.path,
    originalName: fileInput.originalName,
    createdAt: expect.any(Date) as Date, // 생성일자는 자동 생성되므로, 생성일자를 비교하지 않는다.
  };
};

export const getExpectedSessionOutput = (
  userId: number,
  fresh: boolean,
): SessionOutput => {
  return {
    id: expect.any(String) as string, // 세션 ID는 자동 생성되므로, 세션 ID를 비교하지 않는다.
    userId,
    fresh,
    expiresAt: expect.any(Date) as Date, // 만료일자는 자동 생성되므로, 만료일자를 비교하지 않는다.
  };
};
