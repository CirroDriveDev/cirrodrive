/* eslint-disable unicorn/filename-case -- 리액트 훅 파일명은 camelCase로 작성합니다. */
import { useState } from "react";
import type { RouterOutput, RouterInput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { userSchema } from "@cirrodrive/schemas";
import { z, type ZodFormattedError } from "zod";
import { trpc } from "@/shared/api/trpc.ts";
import { useModalStore } from "@/shared/store/useModalStore.ts";

const formSchema = z
  .object({
    username: userSchema.shape.username,
    password: userSchema.shape.password,
    passwordConfirm: z.string(),
    email: userSchema.shape.email,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type FormSchema = z.infer<typeof formSchema>;

type UseRegisterOptions = UseTRPCMutationOptions<
  RouterInput["user"]["create"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["user"]["create"]
>;

type Input = RouterInput["user"]["create"] & {
  passwordConfirm: string;
};

interface UseRegister {
  input: Input;

  validationError: ZodFormattedError<FormSchema> | undefined;

  submissionError: string | undefined;

  mutation: ReturnType<typeof trpc.user.create.useMutation>;

  /**
   * Input 요소의 change 이벤트를 처리하는 함수
   *
   * Input 요소의 `name` 속성이 `username`, `password`, `email` 중 하나여야 한다.
   *
   * @param e - Input 요소의 change 이벤트 객체
   */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Form 요소의 submit 이벤트를 처리하는 함수
   *
   * @param e - Form 요소의 submit 이벤트 객체
   */
  handleFormSubmit: (e: React.FormEvent) => void;
}

export const useRegister = (opts?: UseRegisterOptions): UseRegister => {
  const { openModal } = useModalStore();
  const [input, setInput] = useState<Input>({
    username: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<FormSchema>>();

  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.user.create.useMutation({
    ...opts,
    onSuccess: (data, variable, context) => {
      openModal({
        title: "회원가입 성공",
        content: (
          <div className="flex items-center justify-center">
            {data.username}님, Cirrodrive에 가입하신 것을 환영합니다!
          </div>
        ),
      });
      opts?.onSuccess?.(data, variable, context);
    },
    onError: (error, variable, context) => {
      setSubmissionError(error.message);
      opts?.onError?.(error, variable, context);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value,
    });
  };

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const result = formSchema.safeParse(input);

    if (result.success) {
      setValidationError(undefined);
      mutation.mutate({
        username: result.data.username,
        password: result.data.password,
        email: result.data.email,
      });
    } else {
      setValidationError(result.error.format());
      setSubmissionError(undefined);
    }
  };

  return {
    input,
    mutation,
    validationError,
    submissionError,
    handleInputChange,
    handleFormSubmit,
  };
};
