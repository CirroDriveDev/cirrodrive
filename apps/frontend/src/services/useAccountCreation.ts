import { toast } from "react-toastify"; // Ensure toast is properly imported
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
import { useEmailCode } from "#services/useEmailCode.js";

const accountCreationSchema = z
  .object({
    username: z.string().min(1, "이름을 입력하세요."),
    email: z.string().email("유효한 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z
      .string()
      .min(8, "비밀번호 확인도 최소 8자 이상이어야 합니다."),
    profileImageUrl: z
      .string()
      .url("올바른 URL 형식이어야 합니다.")
      .optional()
      .or(z.literal("")), // 빈 문자열 허용
    isAdmin: z.boolean(),
    verificationCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

type AccountCreationInput = z.infer<typeof accountCreationSchema>;

type UseAccountCreationOptions = UseTRPCMutationOptions<
  RouterInput["protected"]["user"]["create"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["protected"]["user"]["create"]
>;

export interface UseAccountCreationReturn {
  email: string;
  verificationCode: string;
  timer: number;
  cooldown: number;
  isEmailVerified: boolean;
  sendError?: string;
  verifyError?: string;
  input: AccountCreationInput;
  validationError: ZodFormattedError<AccountCreationInput> | undefined;
  submissionError: string | undefined;
  mutation: ReturnType<typeof trpc.protected.user.create.useMutation>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleCodeInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendCode: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
}

export const useAccountCreation = (
  opts?: UseAccountCreationOptions,
): UseAccountCreationReturn => {
  const [input, setInput] = useState<AccountCreationInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImageUrl: "",
    isAdmin: false,
    verificationCode: "",
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<AccountCreationInput>>();
  const [submissionError, setSubmissionError] = useState<string>();

  const {
    email,
    verificationCode,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
  } = useEmailCode();

  const mutation = trpc.protected.user.create.useMutation({
    ...opts,
    onSuccess: (_data) => {
      setSubmissionError(undefined);
      setInput({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImageUrl: "",
        isAdmin: false,
        verificationCode: "",
      });
      // 관리자 계정 여부에 따라 다른 메시지 표시
      if (input.isAdmin) {
        toast.success("관리자 계정 생성이 완료되었습니다.");
      } else {
        toast.success("계정 생성이 완료되었습니다.");
      }
    },
    onError: (error) => {
      setSubmissionError(
        error.message || "사용자 생성 중 오류가 발생했습니다.",
      );
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

    if (!isEmailVerified) {
      setSubmissionError("이메일 인증이 필요합니다.");
      return;
    }

    const result = accountCreationSchema.safeParse({
      ...input,
      email,
      verificationCode,
    });

    if (result.success) {
      setValidationError(undefined);

      const { username, password, isAdmin, profileImageUrl } = result.data;

      mutation.mutate({
        username,
        email,
        password,
        isAdmin,
        usedStorage: 0,
        currentPlanId: "",
        profileImageUrl: profileImageUrl ?? null,
      });
    } else {
      setValidationError(result.error.format());
      setSubmissionError(undefined);
    }
  };

  return {
    email,
    verificationCode,
    timer,
    cooldown,
    isEmailVerified,
    sendError,
    verifyError,
    input,
    validationError,
    submissionError,
    mutation,
    handleInputChange,
    handleFormSubmit,
    handleCodeInputChange,
    handleSendCode,
    handleVerifyCode,
  };
};
