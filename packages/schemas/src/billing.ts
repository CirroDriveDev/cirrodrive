import { z } from "zod";

// enums
export const SubscriptionStatusEnum = z.enum([
  "TRIAL",
  "ACTIVE",
  "CANCELED",
  "EXPIRED",
  "UNPAID",
]);

export const PaymentStatusEnum = z.enum([
  "READY",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
  "FAILED",
]);

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
export const IntervalEnum = z.enum(["MONTHLY", "YEARLY"]);

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  price: z.number().int(),
  interval: IntervalEnum,
  intervalCount: z.number().int(),
  durationDays: z.number().int(),
  storageLimit: z.number().int(),
  trialDays: z.number().int(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const planDTOSchema = PlanSchema.pick({
  id: true,
  name: true,
  description: true,
  price: true,
  interval: true,
  intervalCount: true,
  durationDays: true,
  storageLimit: true,
  trialDays: true,
});

export type PlanDTO = z.infer<typeof planDTOSchema>;

export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: SubscriptionStatusEnum,
  startedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  nextBillingAt: z.coerce.date(),
  canceledAt: z.coerce.date().optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
  trialEndsAt: z.coerce.date().optional().nullable(),
});

export const subscriptionDTOSchema = SubscriptionSchema.extend({
  plan: PlanSchema,
});

export const BillingMethodEnum = z.enum(["CARD"]);
export const CardTypeEnum = z.enum(["CREDIT", "DEBIT", "GIFT"]);
export const CardOwnerTypeEnum = z.enum(["PERSONAL", "CORPORATE"]);

export const BillingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mId: z.string(),
  customerKey: z.string(),
  authenticatedAt: z.coerce.date(),
  method: BillingMethodEnum,
  billingKey: z.string(),
  cardIssuerCode: z.string(),
  cardAcquirerCode: z.string(),
  cardNumber: z.string(),
  cardType: CardTypeEnum,
  cardOwnerType: CardOwnerTypeEnum,
  cardCompany: z.string(),
  priority: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// 프론트엔드에 노출 가능한 BillingDTO (민감 정보 제외)
export const BillingDTOSchema = BillingSchema.pick({
  id: true,
  userId: true,
  method: true,
  cardIssuerCode: true,
  cardAcquirerCode: true,
  cardNumber: true,
  cardType: true,
  cardOwnerType: true,
  cardCompany: true,
  priority: true,
  createdAt: true,
});

export type BillingDTO = z.infer<typeof BillingDTOSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  userId: z.string(),
  amount: z.number().int(),
  currency: z.string().default("KRW"),
  paymentKey: z.string(),
  orderId: z.string(),
  status: PaymentStatusEnum,
  approvedAt: z.coerce.date().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  canceledAt: z.coerce.date().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
});

export const paymentDTOSchema = PaymentSchema.pick({
  id: true,
  subscriptionId: true,
  userId: true,
  amount: true,
  currency: true,
  status: true,
  approvedAt: true,
  receiptUrl: true,
  createdAt: true,
});

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type PaymentDTO = z.infer<typeof paymentDTOSchema>;

export const UsageRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  usedStorage: z.number().int(),
  usedTraffic: z.number().int(),
  recordedAt: z.coerce.date(),
});
