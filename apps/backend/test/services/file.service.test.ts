import { createMockLogger } from "test/utils/create-mock-logger";
import { createMock } from "test/utils/create-mocked.ts";
import { createMockFile } from "test/utils/create-mock-data.ts";
import { FileService } from "@/services/file.service";
import { NotFoundError } from "@/errors/error-classes.ts";
import type { FileRepositoryInterface } from "@/repositories/file.repository";
import type { FileDomainService } from "@/services/file-domain.service";
import type { S3Service } from "@/services/s3.service";

describe("FileService.createFile", () => {
  const mockLogger = createMockLogger();
  const mockS3Service = createMock<S3Service>();
  const mockFileRepository = createMock<FileRepositoryInterface>();
  const mockFileDomainService = createMock<FileDomainService>();

  const fileService = new FileService(
    mockLogger,
    mockS3Service as unknown as S3Service,
    mockFileRepository as unknown as FileRepositoryInterface,
    mockFileDomainService as unknown as FileDomainService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFile", () => {
    test.todo("부모가 디렉터리가 아니면 예외를 발생시킨다");
    test("부모 디렉터리가 존재하지 않으면 NotFoundError를 발생시킨다", async () => {
      mockFileRepository.get.mockRejectedValue(
        new NotFoundError("Parent directory not found"),
      );

      await expect(() =>
        fileService.createFile({
          name: "test.txt",
          parentId: "nonexistent",
          ownerId: "user123",
          mimeType: "text/plain",
          size: 1024,
          hash: "abc123",
          s3Key: "some-key",
        }),
      ).rejects.toThrow(NotFoundError);
    });
    test.todo("새 파일을 생성한다");

    test("부모 디렉터리가 존재하고 디렉터리이면 파일을 생성한다", async () => {
      const parent = createMockFile({
        id: "parent123",
        isDir: true,
        fullPath: "/parent",
      });

      const resultFile = createMockFile({
        id: "file123",
        name: "safe.txt",
        parentId: parent.id,
        fullPath: "/parent/safe.txt",
        s3Key: "some-key",
        mimeType: "text/plain",
        size: 1024,
        hash: "abc123",
      });

      mockFileRepository.get.mockResolvedValue(parent);
      mockFileDomainService.ensureSafeFileName.mockResolvedValue("safe.txt");
      mockFileRepository.create.mockResolvedValue(resultFile);

      const result = await fileService.createFile({
        name: "test.txt",
        parentId: "parent123",
        ownerId: "user123",
        mimeType: "text/plain",
        size: 1024,
        hash: "abc123",
        s3Key: "some-key",
      });

      expect(result.name).toBe("safe.txt");
      expect(mockFileRepository.create).toHaveBeenCalledOnce();
    });
  });

  describe("createDirectory", () => {
    test.todo("부모가 디렉터리가 아니면 예외를 발생시킨다");
    test.todo("이름을 정제한 후 새 디렉터리를 생성한다");
  });

  describe("rename", () => {
    test.todo("대상이 존재하지 않으면 예외를 발생시킨다");
    test.todo("엔트리의 이름을 변경한다");
  });

  describe("move", () => {
    test.todo("대상이 디렉터리가 아니면 예외를 발생시킨다");
    test.todo("원본이 존재하지 않으면 예외를 발생시킨다");
    test.todo("원본과 대상이 동일하면 예외를 발생시킨다");
    test.todo("이름을 정제한 후 엔트리를 이동한다");
  });

  describe("trash", () => {
    test.todo("파일 상태를 TRASHED로 변경한다");
  });

  describe("archive", () => {
    test.todo("파일 상태를 ARCHIVED로 변경한다");
  });

  describe("hardDelete", () => {
    test.todo("파일이 존재하지 않으면 예외를 발생시킨다");
    test.todo("S3와 레포지토리에서 파일을 삭제한다");
  });

  describe("listContents", () => {
    test.todo("디렉터리의 하위 엔트리 목록을 반환한다");
  });

  describe("listTrashEntries", () => {
    test.todo("휴지통 상태인 파일만 반환한다");
  });

  describe("listFileByUserId", () => {
    test.todo("ACTIVE 상태인 파일만 반환한다");
  });

  describe("getFolderById", () => {
    test.todo("디렉터리가 존재하면 반환한다");
    test.todo("디렉터리가 아니면 null을 반환한다");
  });

  describe("copy", () => {
    test.todo("파일을 새 디렉터리로 복사한다");
    test.todo("디렉터리를 재귀적으로 복사한다");
  });
});
