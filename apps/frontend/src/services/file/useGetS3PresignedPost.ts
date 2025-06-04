import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";

/**
 * S3 Presigned Post를 요청하는 커스텀 훅
 *
 * @returns S3 Presigned Post를 요청하는 함수와 mutation 상태 객체
 */
export function useGetS3PresignedPost() {
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.file.upload.getS3PresignedPost.mutationOptions(),
  );

  return {
    /**
     * 파일 정보를 받아 Presigned Post를 요청합니다.
     *
     * @param fileName - 업로드할 파일 이름
     * @param fileType - 업로드할 파일의 MIME 타입
     * @param fileSize - 업로드할 파일의 크기 (bytes)
     * @returns
     */
    getS3PresignedPost: (fileName: string, fileType: string, fileSize: number) => {
      mutation.mutate(
        {
          fileName,
          fileType,
          fileSize,
        },
        {
          onSuccess: () => {
            void entryUpdatedEvent();
          },
        },
      );
    },
    /**
     * 파일 정보를 받아 Presigned Post를 요청합니다.
     *
     * @param fileName - 업로드할 파일 이름
     * @param fileType - 업로드할 파일의 MIME 타입
     * @param fileSize - 업로드할 파일의 크기 (bytes)
     * @returns PresignedPost
     */
    getS3PresignedPostAsync: async (fileName: string, fileType: string, fileSize: number) => {
      return await mutation.mutateAsync(
        {
          fileName,
          fileType,
          fileSize,
        },
        {
          onSuccess: () => {
            void entryUpdatedEvent();
          },
        },
      );
    },
    data: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
