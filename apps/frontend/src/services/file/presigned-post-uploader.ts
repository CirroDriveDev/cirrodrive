import { useGetS3PresignedPost } from "#services/file/useGetS3PresignedPost.js";
import { useBoundStore } from "#store/useBoundStore.js";
import type { UploadResult, UseUploader } from "#types/use-uploader.js";

/**
 * Presigned Post 방식 S3 파일 업로드 전략 훅 (UseUploader 인터페이스 준수)
 */
export const usePresignedPostUploader: UseUploader = () => {
  const { user } = useBoundStore();
  const mutation = useGetS3PresignedPost();
  // 1. presigned post 정보 요청
  const getS3PresignedPost = async (file: File) => {
    let contentType = file.type;
    if (contentType === "") {
      contentType = "application/octet-stream"; // 기본값 설정
    }

    const result = await mutation.getS3PresignedPostAsync(
      file.name,
      contentType,
    );
    return result.presignedPost;
  };

  // 2. presigned post로 S3에 업로드
  const uploadPresignedPost = async (
    file: File,
    presignedPost: { url: string; fields: Record<string, string> },
  ) => {
    const { url, fields } = presignedPost;

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("x-amz-meta-userId", user?.id ?? "anonymous");

    formData.append("file", file);
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    return res;
  };

  const upload = async (file: File): Promise<UploadResult> => {
    const presignedPost = await getS3PresignedPost(file);
    const res = await uploadPresignedPost(file, presignedPost);
    if (!res.ok) {
      return {
        success: false,
        file,
        error: `Failed to upload file: ${res.status} ${res.statusText}`,
      };
    }

    return {
      success: true,
      file,
      key: presignedPost.fields.key,
    };
  };

  return { upload };
};
