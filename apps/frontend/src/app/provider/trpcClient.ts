import { httpBatchLink } from "@trpc/client";
import { SuperJSON } from "superjson";
import { trpc } from "@/shared/api/trpc.ts";

const VITE_TRPC_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;
const VITE_TRPC_SERVER_PORT = import.meta.env.VITE_API_SERVER_PORT;
const TRPC_PATH = "/trpc";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${VITE_TRPC_SERVER_URL}:${VITE_TRPC_SERVER_PORT}${TRPC_PATH}`,
      transformer: SuperJSON,
    }),
  ],
});
