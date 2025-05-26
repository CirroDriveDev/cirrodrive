import { useState } from "react";

// 업로드 결과 타입 정의
export interface UploadResult {
  file: File;
  status: "success" | "error";
  error?: string;
}

// 훅 반환 타입
export interface UseUploadFilesResult {
  isUploading: boolean;
  uploadResults: UploadResult[];
  uploadFiles: (files: File[]) => Promise<void>;
}

/**
 * 다중 파일 업로드 상태 및 병렬 업로드 로직을 관리하는 커스텀 훅
 */
export function useUploadFiles(): UseUploadFilesResult {
  const [isUploading, setIsUploading] = useState(false); // 업로드 중 여부
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]); // 업로드 결과 배열

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const results: UploadResult[] = [];

    // 동시에 3개까지만 업로드
    const limit = 3;
    const queue = [...files];
    const inProgress: Promise<void>[] = [];

    const uploadSingleFile = async (file: File): Promise<void> => {
      try {
        // Presigned POST 요청 (API가 아직 준비되지 않음)
        /*
        const { url, fields } = await api.getPresignedPostUrl({
          fileName: file.name,
          fileType: file.type,
        });
        */

        // 실제 업로드 요청
        /*
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        await fetch(url, {
          method: "POST",
          body: formData,
        });
        */

        // Simulate an asynchronous operation
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        }); //속도

        // 업로드 성공으로 간주
        results.push({ file, status: "success" });
      } catch (error) {
        // 업로드 실패 처리
        results.push({
          file,
          status: "error",
          error: error instanceof Error ? error.message : "업로드 실패", // 실제로는 error.message 등 사용 가능
        });
      }
    };

    while (queue.length > 0 || inProgress.length > 0) {
      while (inProgress.length < limit && queue.length > 0) {
        const file = queue.shift()!;
        const task = uploadSingleFile(file).then(() => {
          const index = inProgress.indexOf(task);
          if (index > -1) {
            void inProgress.splice(index, 1); // 완료된 작업 제거
          }
        });
        inProgress.push(task);
      }

      await Promise.race(inProgress); // 가장 먼저 끝난 작업 기다림
    }

    setUploadResults(results);
    setIsUploading(false);
  };

  return {
    isUploading,
    uploadResults,
    uploadFiles,
  };
}
