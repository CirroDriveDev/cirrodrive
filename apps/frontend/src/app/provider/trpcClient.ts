import { httpBatchLink } from "@trpc/client";
import { SuperJSON } from "superjson";
import { trpc } from "@/shared/api/trpc.ts";

const TRPC_PATH = "/trpc";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `http://${import.meta.env.VITE_EC2_PUBLIC_URL}:${import.meta.env.VITE_SERVER_PORT}${TRPC_PATH}`,
      transformer: SuperJSON,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
