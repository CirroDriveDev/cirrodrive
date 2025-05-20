import { createTRPCContext } from "@trpc/tanstack-react-query";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@cirrodrive/backend/app-router";
import { env } from "#app/env.js";

/**
 * API를 호출하기 위한 trpc 인스턴스입니다.
 *
 * 백엔드와 연동하는 부분은 trpcClient에서 처리합니다.
 *
 * @see \@/src/app/provider/trpcClient.ts
 */
export const trpc = createTRPCReact<AppRouter>();

export const { useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

export const TRPC_PATH = "/trpc";
export const TRPC_URL = `http://${env.VITE_API_HOST}:${env.VITE_API_PORT}${TRPC_PATH}`;
