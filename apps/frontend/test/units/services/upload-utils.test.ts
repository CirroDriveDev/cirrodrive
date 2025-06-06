import { describe, test, expect, vi } from "vitest";
import {
  shouldUseMultipart,
  createUploadId,
  formatUploadError,
  UPLOAD_CONFIG,
} from "#services/upload/upload-utils.js";

describe("upload-utils", () => {
  describe("shouldUseMultipart", () => {
    test("큰 파일은 멀티파트를 사용한다", () => {
      // 실제 큰 데이터 대신 File 객체의 size 속성만 설정
      const largeFile = new File(["dummy"], "large.bin");
      Object.defineProperty(largeFile, 'size', { value: 200 * 1024 * 1024 });
      expect(shouldUseMultipart(largeFile)).toBe(true);
    });

    test("작은 파일은 멀티파트를 사용하지 않는다", () => {
      const smallFile = new File(["hello"], "small.txt");
      expect(shouldUseMultipart(smallFile)).toBe(false);
    });

    test("임계값과 같은 크기는 멀티파트를 사용한다", () => {
      const thresholdFile = new File(["dummy"], "threshold.bin");
      Object.defineProperty(thresholdFile, 'size', { value: UPLOAD_CONFIG.multipart.threshold });
      expect(shouldUseMultipart(thresholdFile)).toBe(true);
    });
  });

  describe("createUploadId", () => {
    test("고유한 ID를 생성한다", () => {
      const mockUUID = "test-uuid-uuid-uuid-123";
      vi.stubGlobal("crypto", {
        randomUUID: () => mockUUID,
      });

      const id = createUploadId();
      expect(id).toBe(mockUUID);
    });

    test("매번 다른 ID를 생성한다", () => {
      let counter = 0;
      vi.stubGlobal("crypto", {
        randomUUID: () => `uuid-${++counter}`,
      });

      const id1 = createUploadId();
      const id2 = createUploadId();

      expect(id1).not.toBe(id2);
      expect(id1).toBe("uuid-1");
      expect(id2).toBe("uuid-2");
    });
  });

  describe("formatUploadError", () => {
    test("Error 객체를 포맷한다", () => {
      const error = new Error("네트워크 오류");
      const formatted = formatUploadError(error);
      expect(formatted).toBe("네트워크 오류");
    });

    test("AbortError를 특별히 처리한다", () => {
      const error = new Error("취소됨");
      error.name = "AbortError";
      const formatted = formatUploadError(error);
      expect(formatted).toBe("업로드가 취소되었습니다");
    });

    test("문자열 에러를 처리한다", () => {
      const formatted = formatUploadError("문자열 에러");
      expect(formatted).toBe("알 수 없는 오류가 발생했습니다");
    });

    test("undefined/null 에러를 처리한다", () => {
      expect(formatUploadError(undefined)).toBe(
        "알 수 없는 오류가 발생했습니다",
      );
      expect(formatUploadError(null)).toBe("알 수 없는 오류가 발생했습니다");
    });

    test("객체 에러를 처리한다", () => {
      const formatted = formatUploadError({ message: "객체 에러" });
      expect(formatted).toBe("알 수 없는 오류가 발생했습니다");
    });
  });

  describe("UPLOAD_CONFIG", () => {
    test("설정값이 올바르게 로드된다", () => {
      expect(UPLOAD_CONFIG).toBeDefined();
      expect(UPLOAD_CONFIG.multipart).toBeDefined();
      expect(UPLOAD_CONFIG.multipart.threshold).toBeGreaterThan(0);
      expect(UPLOAD_CONFIG.multipart.chunkSize).toBeGreaterThan(0);
      expect(UPLOAD_CONFIG.multipart.maxConcurrency).toBeGreaterThan(0);
    });
  });
});
