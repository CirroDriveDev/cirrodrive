import { prisma } from "#client";

describe("Prisma Client", () => {
  test("데이터베이스에 연결할 수 있어야 한다.", async () => {
    const result = await prisma.$executeRaw`SELECT 1 + 1 AS result`;
    expect(result).toBeDefined();
  });
});
