import { clearDatabase } from "#src/utils";
import { prisma } from "#client";
import { createPlan } from "#src/seed-utils/create-plan";

// 실제 통합 테스트를 위한 설정
describe("Database Utils", () => {
  // 테스트 데이터
  const testData = {
    name: "Free",
    description: "기본 기능을 무료로 제공합니다.",
    price: 0,
    interval: "MONTHLY",
    storageLimit: 1024, // 1GB = 1024MB
    trialDays: 0,
  } as const;

  // 테스트 전에 환경 확인
  beforeAll(() => {
    // NODE_ENV가 test인지 확인
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "통합 테스트는 반드시 NODE_ENV=test 환경에서 실행되어야 합니다.",
      );
    }

    // DATABASE_URL이 설정되어 있는지 확인
    if (!process.env.DATABASE_URL) {
      throw new Error("통합 테스트를 위해 DATABASE_URL 환경변수가 필요합니다.");
    }

    // 테스트 데이터베이스인지 확인
    if (!process.env.DATABASE_URL.includes("test")) {
      throw new Error(
        "테스트는 테스트 데이터베이스에서만 실행해야 합니다. DATABASE_URL에 'test'가 포함되어야 합니다.",
      );
    }
  });

  beforeEach(async () => {
    // 각 테스트 전에 데이터베이스 초기화
    await clearDatabase();
  });

  // 모든 테스트 후 정리
  afterAll(async () => {
    await clearDatabase();
    // 연결 종료
    await prisma.$disconnect();
  });

  describe("clearDatabase", () => {
    test("데이터베이스를 초기화해야 한다", async () => {
      // Arrange
      await createPlan(testData);

      // Act
      await clearDatabase();

      // Assert
      const planCount = await prisma.plan.count();
      const result = await prisma.$executeRaw`SELECT 1 + 1 AS result`;
      expect(planCount).toBe(0);
      expect(result).toBeDefined();
    });

    test("NODE_ENV가 test가 아닐 경우 에러를 발생시켜야 한다", async () => {
      // 임시로 NODE_ENV를 변경
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      try {
        // clearDatabase 호출 시 에러 발생 예상
        await expect(clearDatabase()).rejects.toThrow(
          "This function should only be used in test environment",
        );
      } finally {
        // 원래 NODE_ENV로 복원
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
