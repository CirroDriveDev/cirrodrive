import type React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/Button.tsx";

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
  const handleClick = (): void => {
    navigate(path);
  };

  return (
    <Button variant="ghost" onClick={handleClick} className="h-10 w-full">
      {icon} <span className="mx-1" />
      {label}
    </Button>
  );
}
