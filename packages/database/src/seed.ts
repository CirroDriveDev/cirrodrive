import { prisma } from "#client";
import { createUser } from "#src/seed-utils/create-user";
import { createPlan } from "#src/seed-utils/create-plan";
import { seedAdmin } from "#src/seed-utils/seed-admin";

export async function seed() {
  // 무료 요금제 생성
  const freePlan = await createPlan({
    name: "Free",
    description: "기본 기능을 무료로 제공합니다.",
    price: 0,
    interval: "MONTHLY",
    intervalCount: 1, // 기본값은 1로 설정
    storageLimit: 1024 * 1024 * 1024, // 1GB in bytes
    trialDays: 0,
  });

  // 스탠다드 요금제 생성
  const standardPlan = await createPlan({
    name: "Standard",
    description: "더 넉넉한 저장 공간과 합리적인 가격.",
    price: 4900,
    interval: "MONTHLY",
    intervalCount: 1, // 기본값은 1로 설정
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB in bytes
    trialDays: 0,
  });

  // 스탠다드 요금제 생성
  await createPlan({
    name: "Standard",
    description: "더 넉넉한 저장 공간과 합리적인 가격.",
    price: 49000,
    interval: "YEARLY",
    intervalCount: 1, // 기본값은 1로 설정
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB in bytes
    trialDays: 7,
  });

  // 프로 요금제 생성
  const proPlan = await createPlan({
    name: "Pro",
    description: "최대 저장 공간과 우선 지원 제공.",
    price: 9900,
    interval: "MONTHLY",
    intervalCount: 1, // 기본값은 1로 설정
    storageLimit: 1024 * 1024 * 1024 * 1024, // 1TB in bytes
    trialDays: 0,
  });

  // 프로 요금제 생성
  await createPlan({
    name: "Pro",
    description: "최대 저장 공간과 우선 지원 제공.",
    price: 99000,
    interval: "YEARLY",
    intervalCount: 1, // 기본값은 1로 설정
    storageLimit: 1024 * 1024 * 1024 * 1024, // 1TB in bytes
    trialDays: 7,
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

  await seedAdmin();
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    throw e;
  });
