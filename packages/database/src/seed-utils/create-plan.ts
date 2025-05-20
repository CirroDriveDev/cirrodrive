import { type $Enums } from "#prisma";
import { prisma } from "#client";

/**
 * 데이터베이스에 새로운 요금제를 생성합니다.
 *
 * @param params - 요금제 생성에 필요한 파라미터 객체
 *
 *   - Name: 요금제 이름
 *   - Description: 요금제 설명
 *   - Features: 요금제 기능
 *   - Price: 요금제 가격
 *   - TrialPeriodDays: 체험 기간(일)
 *   - Currency: 가격의 통화 단위
 *   - Interval: 결제 주기(DAY, WEEK, MONTH, YEAR 등)
 *   - IntervalCount: 결제 주기 횟수
 */
export async function createPlan({
  name,
  description,
  features,
  price,
  trialPeriodDays,
  currency,
  interval,
  intervalCount,
}: {
  name: string;
  description: string;
  features: object;
  price: number;
  trialPeriodDays: number;
  currency: string;
  interval: $Enums.PlanInterval;
  intervalCount: number;
}) {
  const plan = await prisma.plan.create({
    data: {
      name,
      description,
      features,
      price,
      trialPeriodDays,
      currency,
      interval,
      intervalCount,
    },
  });

  return plan;
}
