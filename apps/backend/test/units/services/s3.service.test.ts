import type { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { createMockLogger } from "#test/test-utils/create-mock-logger";
import { S3Service } from "#services/s3.service";

const policyMatcher = expect.stringMatching(/^[A-Za-z0-9+/=]+$/) as string;
const credentialMatcher = expect.stringMatching(
  /^minioadmin\/[0-9]{8}\/ap-northeast-2\/s3\/aws4_request$/,
) as string;
const dateMatcher = expect.stringMatching(/^[0-9]{8}T[0-9]{6}Z$/) as string;
const signatureMatcher = expect.stringMatching(/^[a-f0-9]{64}$/) as string;

const urlMatcher = expect.stringMatching(
  /^https?:\/\/(?:minio|localhost):9000\/test-bucket$/,
) as string;

describe("S3Service", () => {
  const mockLogger = createMockLogger();
  const s3Service = new S3Service(mockLogger);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.todo(
    "generatePresignedPost should create a presigned POST URL",
    async () => {
      // arrange
      const params = {
        fileName: "mockfile.png",
        contentType: "image/png",
      };

      const mockPresignedPost: PresignedPost = {
        fields: {
          "Content-Type": "image/png",
          "Policy": policyMatcher, // "eyJleWFnZS ... RtaWjn1dfQ=="
          "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
          "X-Amz-Credential": credentialMatcher, // "minioadmin/20230515/ap-northeast-2/s3/aws4_request"
          "X-Amz-Date": dateMatcher, // "20250515T103841Z"
          "X-Amz-Signature": signatureMatcher, // "522711314a5545f1f687e0d3b64fea55ed9516664af25e1cbb1123b95cbf7688"
          "bucket": "test-bucket",
          "key": "user-uploads/2025-05-15/mockfile.png",
        },
        url: urlMatcher,
      };

      // act
      const result = await s3Service.createPresignedPost(params);

      // assert
      expect(result).toEqual(mockPresignedPost);
    },
  );
});

describe("S3Service - Key Generation", () => {
  let s3Service: S3Service;

  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "mock-uuid-1234") });
    const logger = createMockLogger();
    s3Service = new S3Service(logger);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("generateKey: 확장자 포함 파일명", () => {
    const fileName = "test.png";
    const key = s3Service.generateKey({ fileName, userId: "anonymous" });
    expect(key).toMatch(
      /^uploads\/anonymous\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.png$/,
    );
  });

  test("generateKey: 확장자 없는 파일명", () => {
    const fileName = "file";
    const key = s3Service.generateKey({ fileName, userId: "anonymous" });
    expect(key).toMatch(
      /^uploads\/anonymous\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.bin$/,
    );
  });

  test("generateKey: 사용자 및 확장자 포함 파일명", () => {
    const userId = "user1";
    const fileName = "test.jpg";
    const key = s3Service.generateKey({ fileName, userId });
    expect(key).toMatch(
      /^uploads\/user1\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.jpg$/,
    );
  });

  test("generateKey: 사용자 및 확장자 없는 파일명", () => {
    const userId = "user1";
    const fileName = "file";
    const key = s3Service.generateKey({ fileName, userId });
    expect(key).toMatch(
      /^uploads\/user1\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.bin$/,
    );
  });

  test("generateKey: 대문자 확장자도 소문자로 변환", () => {
    const userId = "user2";
    const fileName = "photo.JPG";
    const key = s3Service.generateKey({ fileName, userId });
    expect(key).toMatch(
      /^uploads\/user2\/[0-9]{4}-[0-9]{2}-[0-9]{2}-mock-uuid-1234\.jpg$/,
    );
  });
});
