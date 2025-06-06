import { toast } from "react-toastify";
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

// 관리자 게정 생성 검증 스키마
const adminAccountCreationSchema = z
  .object({
    username: z.string().min(1, "관리자 이름을 입력하세요."),
    email: z.string().email("유효한 이메일을 입력하세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z
      .string()
      .min(8, "비밀번호 확인은 최소 8자 이상이어야 합니다."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type AdminAccountCreationInput = z.infer<
  typeof adminAccountCreationSchema
>;

// UseAdminAccountCreationOptions 타입 정의
type UseAdminAccountCreationOptions = UseTRPCMutationOptions<
  RouterInput["protected"]["admin"]["admincreate"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["protected"]["admin"]["admincreate"]
>;

export interface UseAdminAccountCreationReturn {
  input: AdminAccountCreationInput;
  validationError: ZodFormattedError<AdminAccountCreationInput> | undefined;
  submissionError: string | undefined;
  mutation: ReturnType<typeof trpc.protected.admin.admincreate.useMutation>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
}

export const useAdminAccountCreation = (
  opts?: UseAdminAccountCreationOptions,
  onSuccessCallback?: () => void,
): UseAdminAccountCreationReturn => {
  const [input, setInput] = useState<AdminAccountCreationInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] =
    useState<ZodFormattedError<AdminAccountCreationInput>>();
  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.protected.admin.admincreate.useMutation({
    ...opts,
    onSuccess: () => {
      setSubmissionError(undefined);
      // 관리자 계정 생성 성공 후 입력 폼 초기화
      setInput({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      toast.success("관리자 계정 생성이 완료되었습니다.");
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      setSubmissionError(
        error.message || "관리자 계정 생성 중 오류가 발생했습니다.",
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
    const result = adminAccountCreationSchema.safeParse(input);
    if (result.success) {
      setValidationError(undefined);
      const { username, email, password } = result.data;

      // 이메일 반드시 입력
      mutation.mutate({ username, password, email });
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
