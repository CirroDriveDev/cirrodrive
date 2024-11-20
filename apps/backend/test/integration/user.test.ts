import { supertestFetchFactory } from "test/supertestLink.ts";
import { createTRPCClient, httpLink } from "@trpc/client";
// import { SuperJSON } from "superjson";
import { userDTOSchema } from "@cirrodrive/schemas";
import type { AppRouter } from "@/api/appRouter.ts";
import { expressLoader, TRPC_PATH } from "@/loaders/express.ts";
import { prisma } from "@/loaders/prisma.ts";

const app = expressLoader();

describe("User", () => {
  let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;
  const supertestFetch = supertestFetchFactory(app);

  beforeEach(async () => {
    await prisma.user.deleteMany({});
    trpc = createTRPCClient<AppRouter>({
      links: [
        httpLink({
          url: TRPC_PATH,
          fetch: supertestFetch,
          // transformer: SuperJSON,
        }),
      ],
    });
  });

  test("create", async () => {
    const input = {
      username: "testuser",
      password: "testTEST1234!",
      email: "test@example.com",
    };

    const expectedUser = {
      id: expect.any(Number) as number,
      username: "testuser",
      email: "test@example.com",
      pricingPlan: "free",
      usedStorage: 0,
      profileImageUrl: null,
      rootFolderId: expect.any(Number) as number,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    };

    const user = await trpc.user.create.mutate(input);
    expect(userDTOSchema.parse(user)).toStrictEqual(expectedUser);
  });

  test("login", async () => {
    const input = {
      username: "testuser",
      password: "testTEST1234!",
      email: "test@example.com",
    };

    const expectedUser = {
      id: expect.any(Number) as number,
      username: "testuser",
      email: "test@example.com",
      pricingPlan: "free",
      usedStorage: 0,
      profileImageUrl: null,
      rootFolderId: expect.any(Number) as number,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    };

    await trpc.user.create.mutate(input);
    const user = await trpc.session.login.mutate({
      username: input.username,
      password: input.password,
    });
    await trpc.user.me.query();
    expect(userDTOSchema.parse(user)).toStrictEqual(expectedUser);
  });

  test("list", async () => {
    const users = await trpc.user.list.query({});
    expect(users).toHaveLength(0);
  });
});
