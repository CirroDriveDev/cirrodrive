import { z } from "zod";

export const userSchema = z.object({
  id: z.coerce.number(),
  username: z
    .string()
    .min(3, { message: "3글자 이상 입력해주세요." })
    .max(64, { message: "64글자 이하로 입력해주세요." })
    .regex(/^[a-zA-Z0-9-_.]+$/, {
      message: "영문자, 숫자, -_. 만 사용할 수 있습니다.",
    }),
  password: z
    .string()
    .min(8, { message: "8글자 이상 입력해주세요." })
    .max(64, { message: "64글자 이하로 입력해주세요." })
    .regex(/(?=.*[a-z])/, {
      message: "소문자를 포함해주세요.",
    })
    .regex(/(?=.*[A-Z])/, {
      message: "대문자를 포함해주세요.",
    })
    .regex(/(?=.*[0-9])/, {
      message: "숫자를 포함해주세요.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "특수문자를 포함해주세요.",
    })
    .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, {
      message: "영문자, 숫자, !@#$%^&* 만 사용할 수 있습니다.",
    }),

  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  pricingPlan: z.enum(["free", "basic", "premium"]),
  usedStorage: z.coerce.number(),
  profileImageUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userPublicDTOSchema = userSchema.pick({
  id: true,
  username: true,
  email: true,
  profileImageUrl: true,
});

export const UserDTOSchema = userSchema.omit({
  password: true,
});

export type UserDTO = z.infer<typeof UserDTOSchema>;
export type UserPublicDTO = z.infer<typeof userPublicDTOSchema>;
