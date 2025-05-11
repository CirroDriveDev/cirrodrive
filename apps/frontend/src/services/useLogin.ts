import { useState } from "react";
import type { AppRouter, RouterInput, RouterOutput } from "@cirrodrive/backend";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { z, type ZodFormattedError } from "zod";
import { trpc } from "@/services/trpc.ts";
import { useBoundStore } from "@/store/useBoundStore.ts";

const formSchema = z.object({
  username: z.string().min(1, "아이디를 입력하세요."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

type FormSchema = z.infer<typeof formSchema>;

type UseLoginOptions = UseTRPCMutationOptions<
  RouterInput["session"]["login"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["session"]["login"]
>;

interface UseLogin {
  input: RouterInput["session"]["login"];

  validationError: ZodFormattedError<FormSchema> | undefined;

  submissionError: string | undefined;

  mutation: ReturnType<typeof trpc.session.login.useMutation>;

  /**
   * Input 요소의 change 이벤트를 처리하는 함수
   *
   * Input 요소의 `name` 속성이 `username`, `password` 중 하나여야 한다.
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

export const useLogin = (opts?: UseLoginOptions): UseLogin => {
  const { setUser } = useBoundStore();

  const [input, setInput] = useState<RouterInput["session"]["login"]>({
    username: "",
    password: "",
  });

  const [validationError, setValidationError] =
    useState<ZodFormattedError<FormSchema>>();

  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.session.login.useMutation({
    ...opts,
    onSuccess: (data, variable, context) => {
      setUser(data);
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
