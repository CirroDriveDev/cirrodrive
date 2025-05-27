import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { fileUploadRouter } from "#routes/file.upload.router.js";

// Mock 서비스들
const mockCreatePresignedPost = vi.fn();
const mockCompleteUpload = vi.fn();
const mockCreateCode = vi.fn();

vi.mock("#services/s3.service.js", () => ({
  S3Service: vi.fn().mockImplementation(() => ({
    createPresignedPost: mockCreatePresignedPost,
  })),
}));

vi.mock("#services/file.upload.service.js", () => ({
  FileUploadService: vi.fn().mockImplementation(() => ({
    completeUpload: mockCompleteUpload,
  })),
}));

vi.mock("#services/file-access-code.service.js", () => ({
  FileAccessCodeService: vi.fn().mockImplementation(() => ({
    create: mockCreateCode,
  })),
}));

const fakeUser = {
  id: "user123",
  username: "testuser",
  hashedPassword: "hashed_pw",
  email: "test@example.com",
  currentPlanId: "plan_basic",
  usedStorage: 0,
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isAdmin: false,
  rootFolderId: "root_folder_id",
  trashFolderId: "trash_folder_id",
};

describe("fileUploadRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getS3PresignedPost returns presigned post", async () => {
    const input = {
      fileName: "testfile.png",
      fileType: "image/png",
    };
    const fakePresignedPost = {
      url: "https://fake-s3-url",
      fields: {
        "key": "testfile.png",
        "Content-Type": "image/png",
      },
    };
    mockCreatePresignedPost.mockResolvedValue(fakePresignedPost);

    const caller = fileUploadRouter.createCaller({
      req: {
        body: {},
        cookies: {},
      } as unknown as Request,
      res: {} as unknown as Response,
      user: fakeUser,
      session: null,
      sessionToken: null,
    });

    const result = await caller.getS3PresignedPost(input);

    expect(mockCreatePresignedPost).toHaveBeenCalledWith({
      fileName: input.fileName,
      contentType: input.fileType,
      userId: fakeUser.id,
    });
    expect(result).toEqual({ presignedPost: fakePresignedPost });
  });

  it("completeUpload saves file metadata and returns code", async () => {
    const input = {
      fileName: "mydoc.pdf",
      key: "some/s3/key/mydoc.pdf",
      folderId: "folder123",
    };
    const fakeFile = { id: "file123" };
    const fakeCode = { code: "ACCESSCODE123" };
    mockCompleteUpload.mockResolvedValue(fakeFile);
    mockCreateCode.mockResolvedValue(fakeCode);

    const caller = fileUploadRouter.createCaller({
      req: {
        body: {},
        cookies: {},
      } as unknown as Request,
      res: {} as unknown as Response,
      user: fakeUser,
      session: null,
      sessionToken: null,
    });

    const result = await caller.completeUpload(input);

    expect(mockCompleteUpload).toHaveBeenCalledWith({
      ownerId: "ownerId456",
      name: input.fileName,
      key: input.key,
      parentFolderId: input.folderId,
    });
    expect(mockCreateCode).toHaveBeenCalledWith({ fileId: fakeFile.id });
    expect(result).toEqual({
      fileId: fakeFile.id,
      code: fakeCode.code,
    });
  });
});
