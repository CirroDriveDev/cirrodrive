// useAccountCreation.ts
import { useState } from "react";
import { z, type ZodFormattedError } from "zod";
import type {
  AppRouter,
  RouterInput,
  RouterOutput,
} from "@cirrodrive/backend/app-router";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { trpc } from "#services/trpc.js";

// 계정 생성 폼 유효성 검사 스키마
const accountCreationSchema = z
  .object({
    username: z.string().min(1, "이름을 입력하세요."),
    email: z.string().email("유효한 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z
      .string()
      .min(8, "비밀번호 확인도 최소 8자 이상이어야 합니다."),
    isAdmin: z.boolean(),
    profileImageUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

type AccountCreationInput = z.infer<typeof accountCreationSchema>;

// TRPC Mutation 옵션 타입 (protected.user.create 프로시저)
type UseAccountCreationOptions = UseTRPCMutationOptions<
  RouterInput["protected"]["user"]["create"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["protected"]["user"]["create"]
>;

export interface UseAccountCreationReturn {
  input: AccountCreationInput;
  validationError: ZodFormattedError<AccountCreationInput> | undefined;
  submissionError: string | undefined;
  mutation: ReturnType<typeof trpc.protected.user.create.useMutation>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
}

export const useAccountCreation = (
  opts?: UseAccountCreationOptions,
): UseAccountCreationReturn => {
  const [input, setInput] = useState<AccountCreationInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    profileImageUrl: "",
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<AccountCreationInput>>();
  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.protected.user.create.useMutation({
    ...opts,
    onSuccess: (_data: RouterOutput["protected"]["user"]["create"]) => {
      // 로그인 성공 후 처리 (예: 알림, 폼 리셋 등)
      setSubmissionError(undefined);
      setInput({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        isAdmin: false,
        profileImageUrl: "",
      });
    },
    onError: (error) => {
      setSubmissionError(error.message || "계정 생성에 실패했습니다.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setInput((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = accountCreationSchema.safeParse(input);
    if (result.success) {
      setValidationError(undefined);
      // 서버에 넘길 데이터: confirmPassword는 제거하고, profileImageUrl를 빈 문자열 대신 null 처리
      const { username, email, password, isAdmin, profileImageUrl } =
        result.data;
      mutation.mutate({
        username,
        email,
        password,
        isAdmin,
        profileImageUrl: profileImageUrl ?? null,
        usedStorage: 0,
        currentPlanId: "",
      });
    } else {
      setValidationError(result.error.format());
      setSubmissionError(undefined);
    }
  };

  return {
    input,
    validationError,
    submissionError,
    mutation,
    handleInputChange,
    handleFormSubmit,
  };
};
