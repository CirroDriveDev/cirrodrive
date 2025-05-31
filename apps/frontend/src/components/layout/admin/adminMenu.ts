import { Home, Users, FileText } from "lucide-react";

export const adminMenu = [
  {
    path: "/admin/dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    path: "/admin/user",
    label: "사용자 관리",
    icon: Users,
  },
  {
    path: "/admin/file",
    label: "파일 관리",
    icon: FileText,
  },
];
