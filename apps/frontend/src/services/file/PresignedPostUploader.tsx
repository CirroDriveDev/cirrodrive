import { useRef, useState } from "react";
import { useGetS3PresignedPost } from "@/services/file/useGetS3PresignedPost.ts";

/**
 * Presigned POST 방식으로 S3에 직접 파일을 업로드하는 컴포넌트
 */
export function PresignedPostUploader(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getS3PresignedPost, data, isPending, error } =
    useGetS3PresignedPost();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    getS3PresignedPost(file.name, file.type);
  };

  const handleUpload = async () => {
    const presignedPost = data?.presignedPost;
    const file = fileInputRef.current?.files?.[0];

    if (!presignedPost?.url || !presignedPost?.fields || !file) {
      setMessage("⚠️ 업로드 정보를 찾을 수 없습니다.");
      return;
    }

    const formData = new FormData();
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(presignedPost.url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ 파일이 성공적으로 업로드되었습니다.");
        fileInputRef.current.value = ""; // 입력 초기화
      } else {
        setMessage(`업로드 실패: ${response.statusText}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        disabled={isPending || uploading}
        className="w-full"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!data?.presignedPost || uploading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "업로드"}
      </button>
      {message ? <p>{message}</p> : null}
      {error ? <p className="text-red-500"> 오류: {error.message}</p> : null}
    </div>
  );
}
