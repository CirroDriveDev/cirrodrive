import * as React from "react";
import { Button, type ButtonProps } from "#shadcn/components/Button.js";
import { cn } from "#shadcn/lib/utils.js";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
LoadingSpinner.displayName = "LoadingSpinner";

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      disabled,
      className,
      size,
      ...props
    },
    ref,
  ) => {
    const getSpinnerSize = (
      buttonSize?: "default" | "sm" | "lg" | "icon" | null,
    ) => {
      if (buttonSize === "sm") return "sm";
      if (buttonSize === "lg") return "lg";
      return "md";
    };

    const spinnerSize = getSpinnerSize(size);

    return (
      <Button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={cn(className)}
        size={size}
        {...props}
      >
        {Boolean(isLoading) && (
          <LoadingSpinner size={spinnerSize} className="mr-2" />
        )}
        {isLoading ? (loadingText ?? "로딩 중...") : children}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton, type LoadingButtonProps };
