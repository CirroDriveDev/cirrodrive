import { describe, test, expect, vi } from "vitest";
import { createTestFile } from "../../test-utils/file-generators.js";
import { shouldUseMultipart, createUploadId, formatUploadError } from "#services/upload/upload-utils.js";

describe("Upload Integration", () => {
  test("전체 업로드 플로우 통합 테스트", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "integration-test-id",
    });

    // 1. ID 생성
    const uploadId = createUploadId();
    expect(uploadId).toBe("integration-test-id");

    // 2. 작은 파일 - presigned POST 사용
    const smallFile = createTestFile(1024, "small.txt");
    expect(shouldUseMultipart(smallFile)).toBe(false);

    // 3. 큰 파일 - 멀티파트 사용
    const largeFile = new File(["dummy"], "large.bin");
    Object.defineProperty(largeFile, 'size', { value: 200 * 1024 * 1024 });
    expect(shouldUseMultipart(largeFile)).toBe(true);

    // 4. 에러 처리
    const error = new Error("테스트 에러");
    const formattedError = formatUploadError(error);
    expect(formattedError).toBe("테스트 에러");

    const abortError = new Error("취소됨");
    abortError.name = "AbortError";
    const formattedAbortError = formatUploadError(abortError);
    expect(formattedAbortError).toBe("업로드가 취소되었습니다");
  });

  test.each([
    { size: 1024, expectedMultipart: false, description: "1KB 파일" },
    { size: 5 * 1024 * 1024, expectedMultipart: false, description: "5MB 파일 - 임계값 미만" },
    { size: 50 * 1024 * 1024, expectedMultipart: false, description: "50MB 파일 - 임계값 미만" },
    { size: 100 * 1024 * 1024, expectedMultipart: true, description: "100MB 파일 - 임계값" },
    { size: 200 * 1024 * 1024, expectedMultipart: true, description: "200MB 파일 - 임계값 초과" },
  ])("$description: $size 바이트 → 멀티파트 사용: $expectedMultipart", ({ size, expectedMultipart }) => {
    const file = new File(["dummy"], "test.bin");
    Object.defineProperty(file, 'size', { value: size });
    
    expect(shouldUseMultipart(file)).toBe(expectedMultipart);
  });

  test.each([
    { 
      input: new Error("네트워크 오류"), 
      expected: "네트워크 오류",
      description: "Error 객체"
    },
    { 
      input: "문자열 에러", 
      expected: "알 수 없는 오류가 발생했습니다",
      description: "문자열"
    },
    { 
      input: undefined, 
      expected: "알 수 없는 오류가 발생했습니다",
      description: "undefined"
    },
    { 
      input: null, 
      expected: "알 수 없는 오류가 발생했습니다",
      description: "null"
    },
    { 
      input: { message: "객체 에러" }, 
      expected: "알 수 없는 오류가 발생했습니다",
      description: "일반 객체"
    },
  ])("$description 에러 처리 → '$expected'", ({ input, expected }) => {
    expect(formatUploadError(input)).toBe(expected);
  });
});