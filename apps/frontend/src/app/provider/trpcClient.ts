import {
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { trpc, TRPC_URL } from "@/shared/api/trpc.ts";
// import { transformer } from "@cirrodrive/tranformer";

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: TRPC_URL,
        // transformer,
      }),
      false: httpBatchLink({
        url: TRPC_URL,
        // transformer,
      }),
    }),
  ],
});
