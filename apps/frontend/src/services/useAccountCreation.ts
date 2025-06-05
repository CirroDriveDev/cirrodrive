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

// 이메일 인증 관련 필드와 로직은 삭제하고, 단순하게 이름, 이메일, 비밀번호, 비밀번호 확인만 받습니다.
const accountCreationSchema = z
  .object({
    username: z.string().min(1, "이름을 입력하세요."),
    email: z.string().email("유효한 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z
      .string()
      .min(8, "비밀번호 확인도 최소 8자 이상이어야 합니다."),
    // 프로필 이미지 URL은 사용자 입력 대신 제출 시 기본값을 사용합니다.
    profileImageUrl: z
      .string()
      .url("올바른 URL 형식이어야 합니다.")
      .optional()
      .or(z.literal("")),
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
  // verificationCode와 이메일 인증 관련 필드는 제거하고 최소한의 필드만 초기화합니다.
  const [input, setInput] = useState<AccountCreationInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImageUrl: "", // 제출 시 기본 이미지로 대체됨.
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<AccountCreationInput>>();
  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.protected.user.create.useMutation({
    ...opts,
    onSuccess: () => {
      setSubmissionError(undefined);
      // 성공 후 입력폼 초기화
      setInput({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImageUrl: "",
      });
      toast.success("계정 생성이 완료되었습니다.");
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

    const result = accountCreationSchema.safeParse(input);

    if (result.success) {
      setValidationError(undefined);
      const { username, email, password, profileImageUrl } = result.data;
      // 기본 프로필 이미지 URL (cirrodrive/apps/frontend/public/logo.png) 다 이걸로 설정
      const defaultProfileUrl = `${window.location.origin}/logo.png`;
      const finalProfileImageUrl =
        profileImageUrl && profileImageUrl.trim() !== "" ?
          profileImageUrl
        : defaultProfileUrl;

      mutation.mutate({
        username,
        email,
        password,
        usedStorage: 0,
        currentPlanId: "",
        profileImageUrl: finalProfileImageUrl,
      });
    } else {
      setValidationError(result.error.format());
      setSubmissionError(undefined);
    }
  };

  return {
    email: input.email,
    input,
    validationError,
    submissionError,
    mutation,
    handleInputChange,
    handleFormSubmit,
  };
};
