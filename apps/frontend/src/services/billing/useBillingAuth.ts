import { useState } from "react";
import { tossPayments } from "@/services/billing/toss.ts";
import { useBoundStore } from "@/store/useBoundStore.ts";

export function useBillingAuth(successUrl: string, failUrl: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useBoundStore();

  return {
    requestBillingAuth: async (): Promise<void> => {
      if (!user) {
        throw new Error("User is not logged in");
      }
      const payment = tossPayments.payment({ customerKey: user.id });

      setIsLoading(true);
      try {
        await payment.requestBillingAuth({
          method: "CARD",
          successUrl,
          failUrl,
          customerName: user.username,
          customerEmail: user.email,
        });
      } finally {
        setIsLoading(false);
      }
    },
    isLoading,
  };
}
