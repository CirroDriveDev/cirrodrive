import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/services/trpc";
import { uploadWithPresignedPost } from "@/shared/uploaders/uploadWithPresignedPost";
import { entryUpdatedEvent } from "@/services/entryUpdatedEvent";

/**
 * 파일을 S3 Presigned POST 방식으로 업로드하는 훅
 */
export function usePresignedPostUploader() {
  const trpc = useTRPC();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const presigned = await trpc.file.upload.getS3PresignedPost.mutate({
        fileName: file.name,
        fileType: file.type,
      });

      await uploadWithPresignedPost(file, presigned);

      return presigned.url; // 업로드 후 접근 가능한 S3 URL (필요 시)
    },
    onSuccess: () => {
      void entryUpdatedEvent();
    },
  });

  return {
    /**
     * 파일을 업로드합니다
     *
     * @param file 업로드할 File 객체
     */
    uploadFile: (file: File) => mutation.mutate(file),
    isUploading: mutation.isPending,
    uploadedUrl: mutation.data,
    error: mutation.error,
  };
}
