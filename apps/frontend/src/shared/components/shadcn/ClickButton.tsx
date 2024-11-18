// ClickButton.tsx
import type React from "react";

interface ClickButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function ClickButton({
  onClick,
  children,
}: ClickButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}
