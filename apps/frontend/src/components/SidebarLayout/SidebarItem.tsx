import type React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/shadcn/components/Button.tsx";

interface SidebarItemProps {
  label: string;
  path: string;
  icon?: React.ReactNode;
}
export function SidebarItem({
  label,
  path,
  icon,
}: SidebarItemProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = (): void => {
    navigate(path);
  };

  return (
    <Button
      variant={location.pathname === path ? "default" : "ghost"}
      onClick={handleClick}
      className="flex h-8 w-full justify-start space-x-2 pl-9"
    >
      <div>{icon}</div>
      <div>{label}</div>
    </Button>
  );
}
