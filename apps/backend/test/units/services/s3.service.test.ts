import type { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { createMockLogger } from "test/test-utils/create-mock-logger";
import { S3Service } from "@/services/s3.service.ts";

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

  test("generatePresignedPost should create a presigned POST URL", async () => {
    // arrange
    const params = {
      key: "user-uploads/2025-05-15/mockfile.png",
      expires: 120,
      contentType: "image/png",
      maxSizeInBytes: 1024 * 1024 * 5, // 5MB
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
    const result = await s3Service.generatePresignedPost(params);

    // assert
    expect(result).toEqual(mockPresignedPost);
  });
});
