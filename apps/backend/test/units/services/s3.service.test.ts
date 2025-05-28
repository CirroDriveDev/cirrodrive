import {
  createPresignedPost,
  type PresignedPost,
} from "@aws-sdk/s3-presigned-post";
import { createMockLogger } from "#test/test-utils/create-mock-logger";
import { S3Service } from "#services/s3.service";

vi.mock(import("@aws-sdk/s3-presigned-post"), async (importOriginal) => {
  const mod = await importOriginal(); // type is inferred
  return {
    ...mod,
    // replace some exports
    createPresignedPost: vi.fn(),
  };
});

vi.mock(import("@aws-sdk/s3-request-presigner"), async (importOriginal) => {
  const mod = await importOriginal(); // type is inferred
  return {
    ...mod,
    // replace some exports
    getSignedUrl: vi.fn(),
  };
});

describe("S3Service", () => {
  let s3Service: S3Service;
  const mockLogger = createMockLogger();

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

  beforeEach(() => {
    s3Service = new S3Service(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe("createPresignedPost", () => {
    test("should create a presigned POST URL", async () => {
      // arrange
      const params = {
        fileName: "mockfile.png",
        contentType: "image/png",
      };

      const mockPresignedPost: PresignedPost = {
        fields: {
          "Content-Type": "image/png",
          "Policy": `eyJleHBpcmF0aWkLTEyMzQucG5nIn1dfQ==`,
          "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
          "X-Amz-Credential":
            "minioadmin/20250527/ap-northeast-2/s3/aws4_request",
          "X-Amz-Date": "20250527T120000Z",
          "X-Amz-Signature":
            "b55bfdd51b293ccaaae6eec5068654d2ba8a1079070e5e544256348660a0a0e7",
          "bucket": "test-bucket",
          "key": "uploads/anonymous/2025-05-27-mock-uuid-1234.png",
        },
        url: "http://localhost:9000/test-bucket",
      };

      vi.mocked(createPresignedPost).mockResolvedValue(mockPresignedPost);

      // act
      const result = await s3Service.createPresignedPost(params);

      // assert
      expect(result).toMatchObject(mockPresignedPost);
    });
  });

  test("should create a presigned POST URL", async () => {
    // arrange
    const params = {
      fileName: "mockfile.png",
      contentType: "image/png",
      userId: "folder123",
    };

    const mockPresignedPost: PresignedPost = {
      fields: {
        "Content-Type": "image/png",
        "Policy": `eyJleHBpcmF0aWkLTEyMzQucG5nIn1dfQ==`,
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential":
          "minioadmin/20250527/ap-northeast-2/s3/aws4_request",
        "X-Amz-Date": "20250527T120000Z",
        "X-Amz-Signature":
          "b55bfdd51b293ccaaae6eec5068654d2ba8a1079070e5e544256348660a0a0e7",
        "bucket": "test-bucket",
        "key": "uploads/anonymous/2025-05-27-mock-uuid-1234.png",
      },
      url: "http://localhost:9000/test-bucket",
    };

    vi.mocked(createPresignedPost).mockResolvedValue(mockPresignedPost);

    // act
    const result = await s3Service.createPresignedPost(params);

    // assert
    expect(result).toMatchObject(mockPresignedPost);
  });

  describe("generateKey", () => {
    beforeEach(() => {
      vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "mock-uuid-1234") });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    test("확장자 포함 파일명", () => {
      const fileName = "test.png";
      const key = s3Service.generateKey({ fileName, userId: "anonymous" });
      expect(key).toMatch(
        /^uploads\/anonymous\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.png$/,
      );
    });
    test("확장자 없는 파일명", () => {
      const fileName = "file";
      const key = s3Service.generateKey({ fileName, userId: "anonymous" });
      expect(key).toMatch(
        /^uploads\/anonymous\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.bin$/,
      );
    });
    test("사용자 및 확장자 포함 파일명", () => {
      const userId = "user1";
      const fileName = "test.jpg";
      const key = s3Service.generateKey({ fileName, userId });
      expect(key).toMatch(
        /^uploads\/user1\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.jpg$/,
      );
    });
    test("사용자 및 확장자 없는 파일명", () => {
      const userId = "user1";
      const fileName = "file";
      const key = s3Service.generateKey({ fileName, userId });
      expect(key).toMatch(
        /^uploads\/user1\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.bin$/,
      );
    });
    test("대문자 확장자도 소문자로 변환", () => {
      const userId = "user2";
      const fileName = "photo.JPG";
      const key = s3Service.generateKey({ fileName, userId });
      expect(key).toMatch(
        /^uploads\/user2\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.jpg$/,
      );
    });
  });
});
