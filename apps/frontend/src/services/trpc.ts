import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@cirrodrive/backend/app-router";

/**
 * API를 호출하기 위한 trpc 인스턴스입니다.
 *
 * 백엔드와 연동하는 부분은 trpcClient에서 처리합니다.
 *
 * @see \@/src/app/provider/trpcClient.ts
 */
export const trpc = createTRPCReact<AppRouter>();

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export const TRPC_PATH = "trpc";
const protocol = import.meta.env.PROD ? "https" : "http";
const port =
  import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : "";
export const TRPC_URL = `${protocol}://${import.meta.env.VITE_API_HOST}${port}/${TRPC_PATH}`;
