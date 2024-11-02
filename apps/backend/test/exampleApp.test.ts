import { createTRPCClient } from "@trpc/client";
import { SuperJSON } from "superjson";
import { supertestLink } from "test/supertestLink.ts";
import { app, type AppRouter } from "test/exampleApp.ts";

const TRPC_PATH = "/trpc";

describe("tRPC app with session management", () => {
  let client: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeEach(() => {
    // 매 테스트마다 클라이언트 쿠키 초기화
    client = createTRPCClient<AppRouter>({
      links: [
        supertestLink({
          app,
          url: TRPC_PATH,
          transformer: SuperJSON,
        }),
      ],
    });
  });

  it("should login and access profile using tRPC client with cookies", async () => {
    // 로그인 요청
    const loginResponse = await client.login.mutate({ username: "testuser" });
    expect(loginResponse.message).toBe("Logged in successfully");

    // 프로필 접근 (기본 요청)
    const profileResponse = await client.profile.query({ detailed: false });
    expect(profileResponse.username).toBe("testuser");

    // 프로필 접근 (세부 정보 포함)
    const detailedProfileResponse = await client.profile.query({
      detailed: true,
    });
    expect(detailedProfileResponse.username).toBe("testuser");
    expect(detailedProfileResponse.details).toBe(
      "This is detailed user information.",
    );
  });

  it("should return unauthorized for profile access without valid session", async () => {
    await expect(client.profile.query({ detailed: false })).rejects.toThrow(
      "Unauthorized",
    );
  });
});
