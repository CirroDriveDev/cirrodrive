import { type PresignedPost } from "@aws-sdk/s3-presigned-post";
import { type User } from "@cirrodrive/database/prisma";
import { fileUploadRouter } from "#routes/file.upload.router";
import { type Context } from "#loaders/trpc.loader";

describe("fileUploadRouter", () => {
  beforeAll(() => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "mock-uuid-1234") });
    vi.stubGlobal(
      "Date",
      class extends Date {
        constructor() {
          super("2025-05-27T12:00:00Z");
        }
      },
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe("getS3PresignedPost", () => {
    test("presigned post를 반환한다.", async () => {
      // Arrange
      const input = {
        fileName: "testfile.png",
        fileType: "image/png",
      };

      const mockPresignedPost: PresignedPost = {
        fields: {
          "Content-Type": "image/png",
          "Policy": expect.any(String) as string, // 실제 정책 문자열은 호출 시마다 다릅니다.
          "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
          "X-Amz-Credential":
            "minioadmin/20250527/ap-northeast-2/s3/aws4_request",
          "X-Amz-Date": "20250527T120000Z",
          "X-Amz-Signature": expect.any(String) as string, // 실제 서명은 호출 시마다 다릅니다.
          "bucket": "test-bucket",
          "key": "uploads/anonymous/2025-05-27-mock-uuid-1234.png",
        },
        url: "http://localhost:9000/test-bucket",
      };

      // 실제 S3Service 사용
      const caller = fileUploadRouter.createCaller({} as Context);

      // Act
      const result = await caller.getS3PresignedPost(input);

      // Assert
      expect(result.presignedPost).toMatchObject(mockPresignedPost);
    });
  });

  describe("completeUpload", () => {
    test("파일이 없을 경우 에러를 던진다", async () => {
      // Arrange
      const input = {
        fileName: "mydoc.pdf",
        key: "some/s3/key/mydoc.pdf",
        folderId: "folder123",
      };

      const fakeUser: User = {
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
        trialUsed: false,
        rootFolderId: "root_folder_id",
        trashFolderId: "trash_folder_id",
      };

      const caller = fileUploadRouter.createCaller({
        user: fakeUser,
      } as Context);

      // Assert
      await expect(caller.completeUpload(input)).rejects.toThrow();
    });
  });
});
