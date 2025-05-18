// PlanCard에 표시할 데이터 타입
export interface PlanCardData {
  id: string;
  name: string;
  description?: string | null;
  features?: Record<string, unknown> | null;
  price: number;
  trialPeriodDays?: number | null;
  currency: string;
  interval: string;
  intervalCount: number;
  isActive: boolean;
}
