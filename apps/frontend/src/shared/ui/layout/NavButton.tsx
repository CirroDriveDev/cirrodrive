import type React from "react";
import { Button } from "@/shared/components/shadcn/Button.tsx";

interface NavButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function NavButton({ onClick, children }: NavButtonProps): JSX.Element {
  return (
    <Button variant="secondary" className="text-foreground" onClick={onClick}>
      {children}
    </Button>
  );
}
