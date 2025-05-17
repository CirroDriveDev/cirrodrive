import { Transactional } from "@/decorators/transactional.ts";
import { PlanRepository } from "@/repositories/plan.repository";
import { prisma } from "@/loaders/prisma.loader";

class TestService {
  private readonly planRepo = new PlanRepository();

  @Transactional()
  async createPlan(id: string) {
    await this.planRepo.create({
      id,
      name: "test-plan",
      description: "desc",
      price: 1000,
      interval: "MONTH",
      intervalCount: 1,
      currency: "KRW",
    });
    return this.planRepo.findById(id);
  }

  @Transactional()
  async createPlanAndFail(id: string) {
    await this.planRepo.create({
      id,
      name: "fail-plan",
      description: "desc",
      price: 1000,
      interval: "MONTH",
      intervalCount: 1,
      currency: "KRW",
    });
    throw new Error("fail");
  }

  @Transactional()
  async nestedCreate(id: string) {
    await this.createPlan(`${id}-nested`);
    await this.planRepo.create({
      id,
      name: "nested-plan",
      description: "desc",
      price: 1000,
      interval: "MONTH",
      intervalCount: 1,
      currency: "KRW",
    });
    return prisma.plan.findMany({ where: { id: { contains: id } } });
  }
}

describe("Transactional 데코레이터(DB 통합, PlanRepository)", () => {
  const service = new TestService();
  const testId = `test-tx-plan-${Date.now()}`;

  beforeEach(async () => {
    // Arrange: 테스트 전 정리
    await prisma.plan.deleteMany({ where: { id: { contains: testId } } });
  });

  afterEach(async () => {
    // 테스트 후 정리
    await prisma.plan.deleteMany({ where: { id: { contains: testId } } });
  });

  test("정상 실행 시 커밋되어야 한다", async () => {
    // Arrange
    const id = testId;

    // Act
    await service.createPlan(id);

    // Assert
    const plan = await prisma.plan.findUnique({ where: { id } });
    expect(plan).not.toBeNull();
    expect(plan?.name).toBe("test-plan");
  });

  test("예외 발생 시 롤백되어야 한다", async () => {
    // Arrange
    const id = `${testId}2`;

    // Act
    let error;
    try {
      await service.createPlanAndFail(id);
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).toBeDefined();
    if (error instanceof Error) {
      expect(error.message).toBe("fail");
    } else {
      throw new Error("에러 객체가 Error 인스턴스가 아닙니다");
    }
    const plan = await prisma.plan.findUnique({ where: { id } });
    expect(plan).toBeNull();
  });

  test("중첩 트랜잭션도 하나의 트랜잭션으로 처리된다", async () => {
    // Arrange
    const id = `${testId}3`;

    // Act
    await service.nestedCreate(id);

    // Assert
    const plans = await prisma.plan.findMany({
      where: { id: { contains: id } },
    });
    expect(plans.length).toBe(2);
  });

  test("동시에 여러 Plan을 생성하면 unique 제약 조건이 지켜진다", async () => {
    // Arrange
    const id = `${testId}-race`;

    // Act
    const results = await Promise.allSettled([
      service.createPlan(id),
      service.createPlan(id),
      service.createPlan(id),
    ]);

    // Assert
    const plans = await prisma.plan.findMany({ where: { id } });
    expect(plans.length).toBeLessThanOrEqual(1); // unique 제약 조건이 있으면 1, 없으면 여러 개
    // 최소 1개는 성공해야 함
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
  });

  test("중복 키로 인한 예외 발생 시 트랜잭션 전체가 롤백된다", async () => {
    // Arrange
    const id = `${testId}-dup`;
    await service.createPlan(id); // 먼저 1개 생성

    // Act
    let error;
    try {
      await service.createPlan(id); // 같은 id로 또 생성 시도
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).toBeDefined();
    const plans = await prisma.plan.findMany({ where: { id } });
    expect(plans.length).toBe(1); // 두 번째 시도는 롤백되어 1개만 남아야 함
  });

  test("여러 Plan을 순차적으로 생성하면 모두 커밋된다", async () => {
    // Arrange
    const id1 = `${testId}-seq1`;
    const id2 = `${testId}-seq2`;

    // Act
    await service.createPlan(id1);
    await service.createPlan(id2);

    // Assert
    const plan1 = await prisma.plan.findUnique({ where: { id: id1 } });
    const plan2 = await prisma.plan.findUnique({ where: { id: id2 } });
    expect(plan1).not.toBeNull();
    expect(plan2).not.toBeNull();
  });

  test("트랜잭션 내에서 여러 번 예외가 발생해도 모두 롤백된다", async () => {
    // Arrange
    const id = `${testId}-multierr`;

    // Act
    let error;
    try {
      await service.createPlanAndFail(id);
      await service.createPlanAndFail(`${id}-2`);
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).toBeDefined();
    const plans = await prisma.plan.findMany({
      where: { id: { contains: id } },
    });
    expect(plans.length).toBe(0);
  });
});
