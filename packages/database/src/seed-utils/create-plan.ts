import { type $Enums } from "#prisma";
import { prisma } from "#client";

/**
 * 데이터베이스에 새로운 요금제를 생성합니다.
 *
 * @param params - 요금제 생성에 필요한 파라미터 객체
 *
 *   - Name: 요금제 이름
 *   - Description: 요금제 설명
 *   - Price: 요금제 가격
 *   - Interval: 결제 주기(MONTHLY, YEARLY)
 *   - StorageLimit: 저장 용량(Byte 단위)
 *   - TrialDays: 체험 기간(일)
 */
export async function createPlan({
  name,
  description,
  price,
  interval,
  intervalCount,
  storageLimit,
  trialDays,
}: {
  name: string;
  description: string;
  price: number;
  interval: $Enums.Interval;
  intervalCount: number;
  storageLimit: number;
  trialDays: number;
}) {
  const durationDays = {
    MONTHLY: 30,
    YEARLY: 365,
  }[interval];

  const plan = await prisma.plan.upsert({
    create: {
      name,
      description,
      price,
      interval,
      intervalCount,
      durationDays,
      storageLimit,
      trialDays,
    },
    where: {
      name_interval: {
        name,
        interval,
      },
    },
    update: {},
  });

  return plan;
}
