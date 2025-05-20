import {
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
  createTRPCClient,
} from "@trpc/client";
import { SuperJSON } from "superjson";
import { type AppRouter } from "@cirrodrive/backend/app-router";
import { TRPC_URL } from "#services/trpc.js";

export const trpcClient = createTRPCClient<AppRouter>({
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
