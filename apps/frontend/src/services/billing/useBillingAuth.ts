import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useBoundStore } from "@/store/useBoundStore.ts";
import { TOSS_CLIENT_KEY } from "@/services/billing/toss.ts";

export function useBillingAuth(successUrl: string, failUrl: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useBoundStore();

  return {
    requestBillingAuth: async (planId: string): Promise<void> => {
      if (!user) {
        throw new Error("User is not logged in");
      }
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: user.id });

      setIsLoading(true);
      try {
        await payment.requestBillingAuth({
          method: "CARD",
          successUrl: `${location.origin}/${successUrl}/${planId}`,
          failUrl: `${location.origin}/${failUrl}`,
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
