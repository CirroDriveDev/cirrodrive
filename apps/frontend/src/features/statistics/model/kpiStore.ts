import { create } from "zustand";

// KPI 항목 정의
interface KPI {
  totalUsers: number; // 전체 사용자 수
  totalFiles: number; // 전체 파일 수
  todayUploads: number; // 오늘 업로드한 파일 수
  weeklyUploads: number; // 일주일 간 업로드한 파일 수
  todaySignups: number; // 오늘 가입자 수
  weeklySignups: number; // 일주일 간 가입자 수
  todayWithdrawals: number; // 오늘 탈퇴자 수
  weeklyWithdrawals: number; // 일주일 간 탈퇴자 수
}

// Zustand를 통한 store 생성
export const useKpiStore = create<KPI>(() => ({
  totalUsers: 1125,
  totalFiles: 5678,
  todayUploads: 35,
  weeklyUploads: 210,
  todaySignups: 12,
  weeklySignups: 85,
  todayWithdrawals: 2,
  weeklyWithdrawals: 9,
}));
