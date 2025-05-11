import {
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { SuperJSON } from "superjson";
import { trpc, TRPC_URL } from "@/services/trpc.ts";

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: TRPC_URL,
        transformer: {
          serialize: (data) => data as unknown,
          deserialize: SuperJSON.deserialize,
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
      false: httpBatchLink({
        url: TRPC_URL,
        transformer: SuperJSON,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    }),
  ],
});
