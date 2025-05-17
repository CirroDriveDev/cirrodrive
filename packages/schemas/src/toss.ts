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
