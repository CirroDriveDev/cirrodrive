import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Router } from "#app/router.js";
import { ThemeProvider } from "#shadcn/components/ThemeProvider.js";
import { queryClient } from "#app/provider/queryClient.js";
import { trpc, TRPCProvider } from "#services/trpc.js";
import { trpcClient } from "#app/provider/trpcClient.js";
import { ToastRoot } from "#app/provider/toast.js";

export function Provider(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <ThemeProvider>
            <Router />
            <ToastRoot />
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </trpc.Provider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}
