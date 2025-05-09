import type { IncomingHttpHeaders } from "node:http2";
import request from "supertest";
import {
  httpLink,
  type TRPCLink,
  type HTTPLinkOptions,
  type HTTPHeaders,
  type Operation,
} from "@trpc/client";
import { type AnyRouter } from "@trpc/server";
import {
  type DefaultErrorShape,
  type DataTransformerOptions,
} from "@trpc/server/unstable-core-do-not-import";
import { type App } from "supertest/types";

function convertHeaders(
  headers: RequestInit["headers"],
): IncomingHttpHeaders | undefined {
  if (!headers) {
    return undefined;
  }

  const convertedHeaders: IncomingHttpHeaders = {};

  if (Array.isArray(headers)) {
    // string[][] 형식일 경우 변환
    headers.forEach(([key, value]) => {
      if (typeof key !== "string" || typeof value !== "string") {
        throw new Error("Invalid headers format");
      }
      convertedHeaders[key.toLowerCase()] = value;
    });
  } else if (headers instanceof Headers) {
    // Headers 객체일 경우 변환
    headers.forEach((value, key) => {
      convertedHeaders[key.toLowerCase()] = value;
    });
  } else {
    // Record<string, string>일 경우 그대로 할당
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof key !== "string" || typeof value !== "string") {
        throw new Error("Invalid headers format");
      }
      convertedHeaders[key.toLowerCase()] = value;
    });
  }

  return convertedHeaders;
}

export const supertestFetchFactory = (app: App) => {
  // supertest agent 인스턴스 생성
  const agent = request.agent(app);

  // fetch 대체 함수 반환
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const method = options?.method?.toLowerCase() === "post" ? "post" : "get";

    const headers = convertHeaders(options?.headers) ?? {};

    // supertest의 agent로 요청 수행
    const response = await agent[method](url)
      .set(headers)
      .send(options?.body ?? undefined);

    return {
      ok: response.statusCode >= 200 && response.statusCode < 300,
      status: response.statusCode,
      statusText: "Not implemented",
      url,
      type: "basic",
      redirected: false,
      json: async () => Promise.resolve(response.body as unknown),
      text: async () => Promise.resolve(response.text),
      headers: new Headers(response.headers),
      clone: () => {
        throw new Error("Not implemented");
      },
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => Promise.reject(new Error("Not implemented")),
      blob: async () => Promise.reject(new Error("Not implemented")),
      formData: async () => Promise.reject(new Error("Not implemented")),
    } as Response;
  };
};

interface SupertestLinkOptions {
  url: string | URL;
  methodOverride?: "POST";
  headers?:
    | HTTPHeaders
    | ((opts: { op: Operation }) => HTTPHeaders | Promise<HTTPHeaders>);
  app: App;
  transformer?: DataTransformerOptions;
}

export function supertestLink<TRouter extends AnyRouter = AnyRouter>(
  opts: SupertestLinkOptions,
): TRPCLink<TRouter> {
  const httpLinkOpts = {
    ...opts,
    fetch: supertestFetchFactory(opts.app),
  } as HTTPLinkOptions<{
    errorShape: DefaultErrorShape;
    transformer: boolean;
  }>;

  return httpLink<AnyRouter>(httpLinkOpts);
}
