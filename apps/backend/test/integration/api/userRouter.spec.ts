import request from "supertest";
import { createFakeUser } from "test/utils/createFakeObject.ts";
import { dayjs } from "@/loaders/dayjs.ts";
import { expressLoader } from "@/loaders/express.ts";
import { prisma } from "@/loaders/prisma.ts";

const app = expressLoader();

describe("userRouter", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.file.deleteMany({});
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.file.deleteMany({});
  });

  describe("gET /users", () => {
    test("사용자 목록을 응답해야 한다.", async () => {
      // Given
      const expectedUserOutputs = [];
      for (let i = 0; i < 10; i++) {
        const { userOutput } = await createFakeUser();
        expectedUserOutputs.push({
          id: userOutput.id,
          profileImageFileId: userOutput.profileImageFileId,
          nickname: userOutput.nickname,
          createdAt: dayjs(userOutput.createdAt).format(),
        });
      }

      // When
      const response = await request(app).get("/api/v1/users").expect(200);

      // Then
      expect(response.body).toStrictEqual(expectedUserOutputs);
    });
  });
});
