import pLimit from "p-limit";
import {
  shouldUseMultipart,
  UPLOAD_CONFIG,
  type UploadOptions,
  type UploadResult,
} from "./upload-utils.js";
import { trpc } from "#services/trpc.js";

interface UploadCallbacks extends UploadOptions {
  onChunkProgress?: (chunkNumber: number, percent: number) => void;
}

class UploadCore {
  private createMultipartUpload =
    trpc.file.upload.createMultipartUpload.useMutation();
  private getPartUploadUrl = trpc.file.upload.getPartUploadUrl.useMutation();
  private completeMultipartUpload =
    trpc.file.upload.completeMultipartUpload.useMutation();
  private abortMultipartUpload =
    trpc.file.upload.abortMultipartUpload.useMutation();
  private getS3PresignedPost =
    trpc.file.upload.getS3PresignedPost.useMutation();
  private completeUpload = trpc.file.upload.completeUpload.useMutation();

  async uploadFile(
    file: File,
    options: UploadCallbacks = {},
  ): Promise<UploadResult> {
    if (shouldUseMultipart(file)) {
      return this.uploadMultipart(file, options);
    }
    return this.uploadPresignedPost(file, options);
  }

  private async uploadPresignedPost(
    file: File,
    options: UploadCallbacks,
  ): Promise<UploadResult> {
    try {
      // 1. Presigned POST URL 가져오기
      const { presignedPost } = await this.getS3PresignedPost.mutateAsync({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      const { url, fields } = presignedPost;

      // 2. S3에 직접 업로드
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      // 진행률 추적
      if (options.onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            options.onProgress!(percent);
          }
        });
      }

      // 취소 처리
      if (options.signal) {
        options.signal.addEventListener("abort", () => xhr.abort());
      }

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));
      });

      xhr.open("POST", url);
      xhr.send(formData);
      await uploadPromise;

      // 3. 업로드 완료 등록
      const result = await this.completeUpload.mutateAsync({
        fileName: file.name,
        key: fields.key,
        folderId: options.folderId,
      });

      return {
        success: true,
        fileId: result.fileId,
        code: result.code,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "업로드 실패",
      };
    }
  }

  private async uploadMultipart(
    file: File,
    options: UploadCallbacks,
  ): Promise<UploadResult> {
    const chunkSize = UPLOAD_CONFIG.multipart.chunkSize;
    const maxConcurrency = UPLOAD_CONFIG.multipart.maxConcurrency;

    let uploadId: string | undefined;
    let key: string | undefined;

    try {
      // 1. 멀티파트 업로드 시작
      const initResult = await this.createMultipartUpload.mutateAsync({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      uploadId = initResult.uploadId;
      key = initResult.key;

      // 2. 파일을 청크로 분할
      const chunks = this.createChunks(file, chunkSize);

      // 3. 청크들을 병렬로 업로드
      const limit = pLimit(maxConcurrency);
      let uploadedBytes = 0;

      const uploadPromises = chunks.map((chunk, index) =>
        limit(async () => {
          if (!uploadId || !key) throw new Error("Upload not initialized");
          const etag = await this.uploadChunk(
            uploadId,
            key,
            chunk,
            index + 1,
            options,
          );
          uploadedBytes += chunk.size;

          // 전체 진행률 업데이트
          if (options.onProgress) {
            const progress = (uploadedBytes / file.size) * 100;
            options.onProgress(progress);
          }

          return { partNumber: index + 1, etag };
        }),
      );

      const parts = await Promise.all(uploadPromises);

      // 4. 멀티파트 업로드 완료
      if (!uploadId || !key) throw new Error("Upload not initialized");
      const result = await this.completeMultipartUpload.mutateAsync({
        uploadId,
        key,
        parts,
        fileName: file.name,
        folderId: options.folderId,
      });

      return {
        success: true,
        fileId: result.fileId,
        code: result.code,
      };
    } catch (error) {
      // 실패 시 정리
      if (uploadId && key) {
        try {
          await this.abortMultipartUpload.mutateAsync({ uploadId, key });
        } catch {
          // 정리 실패는 무시
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "멀티파트 업로드 실패",
      };
    }
  }

  private createChunks(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const end = Math.min(offset + chunkSize, file.size);
      chunks.push(file.slice(offset, end));
      offset = end;
    }

    return chunks;
  }

  private async uploadChunk(
    uploadId: string,
    key: string,
    chunk: Blob,
    partNumber: number,
    options: UploadCallbacks,
  ): Promise<string> {
    // presigned URL 가져오기
    const { url } = await this.getPartUploadUrl.mutateAsync({
      uploadId,
      key,
      partNumber,
    });

    // 청크 업로드
    const response = await fetch(url, {
      method: "PUT",
      body: chunk,
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Chunk ${partNumber} upload failed: ${response.status}`);
    }

    const etag = response.headers.get("ETag");
    if (!etag) {
      throw new Error(`Chunk ${partNumber}: No ETag received`);
    }

    return etag;
  }
}

export const useUploadCore = () => {
  return new UploadCore();
};
