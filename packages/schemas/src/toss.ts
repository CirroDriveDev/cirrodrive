import { z } from "zod";

export const TossBillingSchema = z.object({
  mId: z.string().min(1).max(14),
  customerKey: z
    .string()
    .min(2)
    .max(300)
    .regex(/[A-Za-z0-9\-_=.@]+/, "customerKey must contain allowed characters"),
  authenticatedAt: z.coerce.date(),
  method: z.enum(["카드"]),
  billingKey: z.string().min(1).max(200),
  card: z.object({
    issuerCode: z.string().length(2),
    acquirerCode: z.string().length(2),
    number: z.string().min(1).max(20),
    cardType: z.enum(["신용", "체크", "기프트"]),
    ownerType: z.enum(["개인", "법인"]),
  }),
  cardCompany: z.string().min(1),
  cardNumber: z.string().min(1).max(20),
});

export type TossBilling = z.infer<typeof TossBillingSchema>;

export const TossPaymentSchema = z.object({
  mId: z.string().max(14),
  lastTransactionKey: z.string().max(64).nullable(),
  paymentKey: z.string().max(200),
  orderId: z.string().min(6).max(64),
  orderName: z.string().max(100),
  taxExemptionAmount: z.number(),
  status: z.enum([
    "READY",
    "IN_PROGRESS",
    "WAITING_FOR_DEPOSIT",
    "DONE",
    "CANCELED",
    "PARTIAL_CANCELED",
    "ABORTED",
    "EXPIRED",
  ]),
  requestedAt: z.coerce.date(),
  approvedAt: z.coerce.date().nullable(),
  useEscrow: z.boolean(),
  cultureExpense: z.boolean(),
  card: z
    .object({
      issuerCode: z.string().length(2),
      acquirerCode: z.string().length(2).nullable(),
      number: z.string().max(20),
      installmentPlanMonths: z.number(),
      isInterestFree: z.boolean(),
      interestPayer: z.enum(["BUYER", "CARD_COMPANY", "MERCHANT"]).nullable(),
      approveNo: z.string().max(8),
      useCardPoint: z.boolean(),
      cardType: z.enum(["신용", "체크", "기프트", "미확인"]),
      ownerType: z.enum(["개인", "법인", "미확인"]),
      acquireStatus: z.enum([
        "READY",
        "REQUESTED",
        "COMPLETED",
        "CANCEL_REQUESTED",
        "CANCELED",
      ]),
      amount: z.number(),
    })
    .nullable(),
  virtualAccount: z.any().nullable(),
  transfer: z.any().nullable(),
  mobilePhone: z.any().nullable(),
  giftCertificate: z.any().nullable(),
  cashReceipt: z.any().nullable(),
  cashReceipts: z.any().nullable(),
  discount: z.any().nullable(),
  cancels: z.any().nullable(),
  secret: z.string().max(50).nullable(),
  type: z.enum(["NORMAL", "BILLING", "BRANDPAY"]),
  easyPay: z
    .object({
      provider: z.string(),
      amount: z.number(),
      discountAmount: z.number(),
    })
    .nullable(),
  country: z.string().length(2),
  failure: z.any().nullable(),
  isPartialCancelable: z.boolean(),
  receipt: z
    .object({
      url: z.string().url(),
    })
    .nullable(),
  checkout: z
    .object({
      url: z.string().url(),
    })
    .nullable(),
  currency: z.string().length(3),
  totalAmount: z.number(),
  balanceAmount: z.number(),
  suppliedAmount: z.number(),
  vat: z.number(),
  taxFreeAmount: z.number(),
  metadata: z.any().nullable(),
  method: z.string(),
  version: z.string(),
});

export type TossPayment = z.infer<typeof TossPaymentSchema>;
