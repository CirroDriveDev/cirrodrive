import { create } from "zustand";

// 업로드된 파일 정보 타입 정의
export interface FileInfo {
  id: string; // 고유 ID (상세보기를 위한 링크용)
  filename: string; // 파일명
  uploadedAt: string; // 업로드 날짜
  size: string; // 용량
}

interface FileStore {
  recentFiles: FileInfo[]; // 최근 업로드된 파일 배열
}

// Zustand store 생성 (5개 mock 파일)
export const useFileStore = create<FileStore>(() => ({
  recentFiles: [
    {
      id: "1",
      filename: "보고서.pdf",
      uploadedAt: "2025-04-12",
      size: "2.3MB",
    },
    {
      id: "2",
      filename: "기획안.docx",
      uploadedAt: "2025-04-11",
      size: "1.1MB",
    },
    {
      id: "3",
      filename: "로고.png",
      uploadedAt: "2025-04-10",
      size: "480KB",
    },
    {
      id: "4",
      filename: "설계서.xlsx",
      uploadedAt: "2025-04-09",
      size: "3.2MB",
    },
    {
      id: "5",
      filename: "계약서.docx",
      uploadedAt: "2025-04-08",
      size: "900KB",
    },
  ],
}));
