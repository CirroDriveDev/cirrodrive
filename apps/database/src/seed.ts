import { PrismaClient } from "../dist/index.js";
import { createPlan } from "./create-plan.js";
import { createUser } from "./create-user.js";
const prisma = new PrismaClient();

async function main() {
  // 무료 요금제 생성
  const basicPlan = await createPlan({
    name: "Free",
    description: "기본 기능을 무료로 제공합니다.",
    features: { storage: "1GB" },
    price: 0,
    trialPeriodDays: 0,
    currency: "KRW",
    interval: "MONTH",
    intervalCount: 1,
  });

  // 유료 요금제 생성
  await createPlan({
    name: "Pro",
    description: "더 많은 저장 공간과 우선 지원을 제공합니다.",
    features: { storage: "5GB" },
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
    basicPlan.id,
  );

  await createUser(
    "testuser2",
    "testTEST1234!",
    "testuser2@example.com",
    basicPlan.id,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
