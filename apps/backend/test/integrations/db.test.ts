import { prisma } from "@/loaders/prisma.loader.ts";

describe("Prisma Client", () => {
  test("데이터베이스에 연결할 수 있어야 한다.", async () => {
    const result = await prisma.user.findFirst();
    expect(result).toBeDefined();
  });
});
