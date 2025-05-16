import { useState } from "react";

export function useBillingAuth(successUrl: string, failUrl: string) {
  const [isLoading, setIsLoading] = useState(false);
  return {
    requestBillingAuth: () => {
      return new Promise<void>(() => {
        throw new Error("Not implemented");
      });
    },
    isLoading,
  };
}
