import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@cirrodrive/backend";

/**
 * API를 호출하기 위한 trpc 인스턴스입니다.
 *
 * 백엔드와 연동하는 부분은 trpcClient에서 처리합니다.
 *
 * @see \@/src/app/provider/trpcClient.ts
 */
export const trpc = createTRPCReact<AppRouter>();
