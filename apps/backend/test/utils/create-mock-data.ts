import type { File } from "@cirrodrive/database";
import { $Enums } from "@cirrodrive/database";
import { faker } from "@faker-js/faker";

/**
 * 테스트용 기본 파일 객체 생성 유틸 필요한 필드는 overrides로 덮어쓸 수 있음
 */
export function createMockFile(overrides: Partial<File> = {}): File {
  return {
    id: faker.string.uuid(),
    name: "test-file.txt",
    isDir: false,
    parentId: faker.string.uuid(),
    ownerId: faker.string.uuid(),
    mimeType: "text/plain",
    size: 1234,
    hash: faker.string.alphanumeric(16),
    s3Key: "test/s3/key",
    fullPath: "/parent/test-file.txt",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: $Enums.FileStatus.ACTIVE,
    archivedAt: null,
    refCount: 1,
    trashedAt: null,
    ...overrides,
  };
}
