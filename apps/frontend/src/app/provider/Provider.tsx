import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/Router.tsx";
import { ThemeProvider } from "@/shadcn/components/ThemeProvider.tsx";
import { queryClient } from "@/app/provider/queryClient.ts";
import { trpc } from "@/services/trpc.ts";
import { trpcClient } from "@/app/provider/trpcClient.ts";

export function Provider(): JSX.Element {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
