// ClickButton.tsx
import type React from "react";

interface ClickButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function ClickButton({ onClick, children }: ClickButtonProps) {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default ClickButton;
