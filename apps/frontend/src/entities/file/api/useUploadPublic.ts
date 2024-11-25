import { useState } from "react";
import type { RouterOutput, RouterInput, AppRouter } from "@cirrodrive/backend";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { trpc } from "@/shared/api/trpc.ts";

type UseUploadOptions = UseTRPCMutationOptions<
  RouterInput["file"]["uploadPublic"],
  TRPCClientErrorLike<AppRouter>,
  RouterOutput["file"]["uploadPublic"]
>;

interface UseUpload {
  selectedFile: File | null;

  code: string | undefined;

  submissionError: string | undefined;

  mutation: ReturnType<typeof trpc.file.uploadPublic.useMutation>;

  /**
   * 파일 선택 이벤트를 처리하는 함수
   *
   * @param e - 파일 선택 이벤트 객체
   */
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Form 요소의 submit 이벤트를 처리하는 함수
   *
   * @param e - Form 요소의 submit 이벤트 객체
   */
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const useUploadPublic = (opts?: UseUploadOptions): UseUpload => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [code, setCode] = useState<string>();
  const [submissionError, setSubmissionError] = useState<string>();

  const mutation = trpc.file.uploadPublic.useMutation({
    ...opts,
    onSuccess: (data, variable, context) => {
      setCode(data.code);
      opts?.onSuccess?.(data, variable, context);
    },
    onError: (error, variable, context) => {
      setSubmissionError(error.message);
      opts?.onError?.(error, variable, context);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    mutation.mutate(formData);
  };

  return {
    selectedFile,
    code,
    mutation,
    submissionError,
    handleFileChange,
    handleFormSubmit,
  };
};
