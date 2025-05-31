import { useGetS3PresignedPost } from "#services/file/useGetS3PresignedPost.js";
import type { S3UploadResult, UseUploader } from "#types/use-uploader.js";

interface S3UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}

/**
 * Presigned POST 방식 S3 업로더 (진행률 + 취소 + 에러 형식 개선)
 */
export const usePresignedPostUploader: UseUploader = () => {
  const mutation = useGetS3PresignedPost();

  // Presigned POST 정보 가져오기
  const getS3PresignedPost = async (file: File) => {
    const contentType = file.type || "application/octet-stream";
    const result = await mutation.getS3PresignedPostAsync(file.name, contentType);
    return result.presignedPost; // { url, fields }
  };

  // 실제 S3에 업로드
  const upload = async (
    file: File,
    options?: S3UploadOptions
  ): Promise<S3UploadResult> => {
    const presignedPost = await getS3PresignedPost(file);
    const { url, fields } = presignedPost;

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    return new Promise<S3UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      // ✅ 업로드 취소
      if (options?.signal) {
        options.signal.addEventListener("abort", () => {
          xhr.abort();
        });
      }

      // ✅ 업로드 진행률
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options?.onProgress) {
          const percent = (event.loaded / event.total) * 100;
          options.onProgress(percent);
        }
      };

      // ✅ 업로드 성공
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            file,
            key: fields.key,
          });
        } else {
          const error = new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          reject(error);
        }
      };

      // ✅ 업로드 오류
      xhr.onerror = () => {
        reject(new Error("Upload error occurred"));
      };

      xhr.send(formData);
    });
  };

  return { upload };
};
