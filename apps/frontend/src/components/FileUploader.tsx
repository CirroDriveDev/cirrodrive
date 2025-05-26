import type React from "react";
import { useRef, useState, useEffect } from "react";
import { useUploadFiles } from "#hooks/useUploadFiles.js";

export function FileUploader(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isUploading, uploadResults, uploadFiles } = useUploadFiles();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);

      setSelectedFiles((prev) => {
        const existing = new Set(prev.map((f) => f.name + f.size));
        return [
          ...prev,
          ...newFiles.filter((f) => !existing.has(f.name + f.size)),
        ];
      });

      setErrorMessage(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("업로드할 파일을 선택해주세요.");
      return;
    }
    await uploadFiles(selectedFiles);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // 업로드 완료된 파일 제거
  useEffect(() => {
    if (uploadResults.length > 0) {
      setSelectedFiles((prev) =>
        prev.filter(
          (file) =>
            !uploadResults.some(
              (result) =>
                result.file.name === file.name &&
                result.file.size === file.size,
            ),
        ),
      );
    }
  }, [uploadResults]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-2xl font-bold">파일 업로드</h2>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="w-full max-w-md border border-gray-300 p-2"
      />

      {errorMessage ?
        <p className="text-red-500">{errorMessage}</p>
      : null}

      {selectedFiles.length > 0 && (
        <div className="mt-4 w-full max-w-md">
          <h3 className="mb-2 text-lg font-semibold">선택한 파일</h3>
          <ul className="space-y-1 text-gray-700">
            {selectedFiles.map((file, index) => (
              <li
                key={file.name + file.size}
                className="flex items-center justify-between border-b pb-1"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => handleRemoveFile(index)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isUploading ? "업로드 중..." : "업로드 시작"}
      </button>

      {uploadResults.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="mb-2 text-lg font-semibold">업로드 결과</h3>
          <ul className="space-y-2">
            {uploadResults.map((result) => (
              <li
                key={result.file.name}
                className={`flex justify-between rounded border p-2 ${
                  result.status === "success" ?
                    "border-green-500 text-green-700"
                  : "border-red-500 text-red-700"
                }`}
              >
                <span>{result.file.name}</span>
                <span>{result.status === "success" ? "성공" : "실패"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
