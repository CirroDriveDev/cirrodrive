import { create } from "zustand";

// 타입 정의
export interface Activity {
  date: string;
  newUsers: number;
  fileUploads: number;
}

interface ActivityStore {
  weeklyActivity: Activity[]; // 7일간 데이터
  monthlyActivity: Activity[]; // 6개월간 데이터
}

// Zustand로 활동 데이터 관리
export const useActivityStore = create<ActivityStore>(() => ({
  weeklyActivity: [
    { date: "04-06", newUsers: 4, fileUploads: 10 },
    { date: "04-07", newUsers: 6, fileUploads: 12 },
    { date: "04-08", newUsers: 3, fileUploads: 9 },
    { date: "04-09", newUsers: 7, fileUploads: 14 },
    { date: "04-10", newUsers: 5, fileUploads: 11 },
    { date: "04-11", newUsers: 8, fileUploads: 16 },
    { date: "04-12", newUsers: 9, fileUploads: 17 },
  ],
  monthlyActivity: [
    { date: "2024-11", newUsers: 140, fileUploads: 230 },
    { date: "2024-12", newUsers: 160, fileUploads: 210 },
    { date: "2025-01", newUsers: 170, fileUploads: 280 },
    { date: "2025-02", newUsers: 190, fileUploads: 300 },
    { date: "2025-03", newUsers: 210, fileUploads: 320 },
    { date: "2025-04", newUsers: 220, fileUploads: 340 },
  ],
}));
