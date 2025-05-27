import { prisma } from "#client";
import { createUser } from "#src/seed-utils/create-user";
import { createPlan } from "#src/seed-utils/create-plan";

export async function seed() {
  // 무료 요금제 생성
  const freePlan = await createPlan({
    name: "Free",
    description: "기본 기능을 무료로 제공합니다.",
    features: { storage: "1GB" },
    price: 0,
    trialPeriodDays: 0,
    currency: "KRW",
    interval: "MONTH",
    intervalCount: 1,
  });

  // 스탠다드 요금제 생성
  const standardPlan = await createPlan({
    name: "Standard",
    description: "더 넉넉한 저장 공간과 합리적인 가격.",
    features: { storage: "20GB", support: "이메일 지원" },
    price: 4900,
    trialPeriodDays: 7,
    currency: "KRW",
    interval: "MONTH",
    intervalCount: 1,
  });

  // 프로 요금제 생성
  const proPlan = await createPlan({
    name: "Pro",
    description: "최대 저장 공간과 우선 지원 제공.",
    features: { storage: "100GB", support: "우선 지원" },
    price: 9900,
    trialPeriodDays: 14,
    currency: "KRW",
    interval: "MONTH",
    intervalCount: 1,
  });

  await createUser(
    "testuser1",
    "testTEST1234!",
    "testuser1@example.com",
    freePlan.id,
  );

  await createUser(
    "testuser2",
    "testTEST1234!",
    "testuser2@example.com",
    freePlan.id,
  );

  await createUser(
    "testuser_free",
    "testTEST1234!",
    "testuser_free@example.com",
    freePlan.id,
  );

  await createUser(
    "testuser_standard",
    "testTEST1234!",
    "testuser_standard@example.com",
    standardPlan.id,
  );

  await createUser(
    "testuser_pro",
    "testTEST1234!",
    "testuser_pro@example.com",
    proPlan.id,
  );
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    throw e;
  });
