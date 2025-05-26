import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "#services/trpc.js";
import { entryUpdatedEvent } from "#services/entryUpdatedEvent.js";

/**
 * Presigned POST 방식으로 S3에 파일을 업로드하는 커스텀 훅
 *
 * @returns 업로드 관련 상태 및 업로드 트리거 함수
 */
export function usePresignedPostUploader() {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const mutation = useMutation(
    trpc.file.upload.getS3PresignedPost.mutationOptions(),
  );

  const requestPresignedPost = (fileName: string, fileType: string) => {
    mutation.mutate(
      { fileName, fileType },
      {
        onSuccess: () => {
          void entryUpdatedEvent();
        },
      },
    );
  };

  const uploadToS3 = async () => {
    const presignedPost = mutation.data?.presignedPost;
    const file = fileInputRef.current?.files?.[0];

    if (!presignedPost?.url || !presignedPost?.fields || !file) {
      setMessage("업로드 정보를 찾을 수 없습니다.");
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
        setMessage("파일이 성공적으로 업로드되었습니다.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(`업로드 실패: ${response.statusText}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    fileInputRef,
    requestPresignedPost,
    uploadToS3,
    isRequesting: mutation.isPending,
    isUploading: uploading,
    error: mutation.error,
    message,
  };
}
