import { z } from "zod";

export const BillingStatusEnum = z.enum([
  "ACTIVE",
  "CANCELED",
  "TRIALING",
  "PAST_DUE",
  "PAUSED",
  "INCOMPLETE",
  "EXPIRED",
]);
export const BillingMethodEnum = z.enum(["CARD"]);
export const PaymentStatusEnum = z.enum([
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "REFUNDED",
  "PENDING",
]);
export const CardTypeEnum = z.enum(["CREDIT", "DEBIT", "GIFT"]);
export const CardOwnerTypeEnum = z.enum(["PERSONAL", "CORPORATE"]);

export const MethodK2ESchema = z.enum(["카드"]).transform((val) => {
  if (val === "카드") return "CARD" as const;
  throw new Error("지원하지 않는 결제 방식입니다.");
});

export const CardTypeK2ESchema = z
  .enum(["신용", "체크", "기프트"])
  .transform((val) => {
    switch (val) {
      case "신용":
        return "CREDIT" as const;
      case "체크":
        return "DEBIT" as const;
      case "기프트":
        return "GIFT" as const;
      default:
        throw new Error("지원하지 않는 카드 타입입니다.");
    }
  });

export const OwnerTypeK2ESchema = z.enum(["개인", "법인"]).transform((val) => {
  if (val === "개인") return "PERSONAL" as const;
  if (val === "법인") return "CORPORATE" as const;
  throw new Error("지원하지 않는 소유자 타입입니다.");
});

export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  features: z.any().optional().nullable(),
  price: z.number().int(),
  trialPeriodDays: z.number().int().optional().nullable(),
  currency: z.string(),
  interval: z.string(),
  intervalCount: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  mId: z.string(),
  customerKey: z.string(),
  authenticatedAt: z.coerce.date(),
  method: BillingMethodEnum,
  billingKey: z.string(),
  startedAt: z.coerce.date(),
  nextBillingAt: z.coerce.date(),
  status: BillingStatusEnum,
  canceledAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  cardId: z.string(),
  planId: z.string(),
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().int(),
  method: BillingMethodEnum,
  status: PaymentStatusEnum,
  transactionId: z.string(),
  refundedAt: z.coerce.date().optional().nullable(),
  canceledAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  rawResponse: z.any().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  subscriptionId: z.string(),
});

export const SubscriptionHistorySchema = z.object({
  id: z.string().uuid(),
  subscriptionId: z.string(),
  oldPlanId: z.string(),
  newPlanId: z.string(),
  changedAt: z.coerce.date(),
});

export const CardSchema = z.object({
  id: z.string().uuid(),
  cardCompany: z.string(),
  issuerCode: z.string(),
  acquirerCode: z.string(),
  number: z.string(),
  cardType: CardTypeEnum,
  ownerType: CardOwnerTypeEnum,
  createdAt: z.coerce.date(),
  userId: z.string(),
});
