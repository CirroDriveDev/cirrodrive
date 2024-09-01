import { faker } from "@faker-js/faker";
import { createFakeUserInput } from "test/utils/createFakeInput.ts";
import { createFakeUser } from "test/utils/createFakeObject.ts";
import { getExpectedUserOutput } from "test/utils/getExpectedOutput.ts";
import { type UserInput, type UserOutput } from "@/types/dto.ts";
import { prisma } from "@/loaders/prisma.ts";
import { container } from "@/loaders/inversify.ts";
import { UserService } from "@/services/userService.ts";

describe("userService", () => {
  const userService: UserService = container.get(UserService);

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

  describe("createUser", () => {
    test("데이터를 입력하면, 사용자를 생성하고 데이터를 반환해야 한다.", async () => {
      // Given
      const userInput = createFakeUserInput();

      // When
      const result = await userService.createUser(userInput);

      // Then
      const expectedUserOutput = getExpectedUserOutput(userInput);

      expect(result).toStrictEqual(expectedUserOutput);
    });
  });

  describe("getUsers", () => {
    test("limit와 offset을 입력하면, 사용자 목록을 반환해야 한다.", async () => {
      // Given
      const limit = faker.number.int({ min: 4, max: 10 });
      const offset = faker.number.int({ min: 1, max: 3 });
      const expectedUserOutputs: UserOutput[] = [];

      for (let i = 0; i < limit; i++) {
        const { userOutput } = await createFakeUser();
        expectedUserOutputs.push(userOutput);
      }
      expectedUserOutputs.splice(0, offset);
      expectedUserOutputs.splice(limit - offset);

      // When
      const result = await userService.getUsers(limit, offset);

      // Then
      const expectedLength = limit - offset;

      expect(result.length).toBe(expectedLength);
      expect(result).toStrictEqual(expectedUserOutputs);
    });
  });

  describe("getUserById", () => {
    test("iD를 입력하면, 사용자 데이터를 반환해야 한다.", async () => {
      // Given
      const { userInput, userOutput } = await createFakeUser();

      // When
      const result = await userService.getUserById(userOutput.id);

      // Then
      const expectedUserOutput = getExpectedUserOutput(userInput);

      expect(result).toStrictEqual(expectedUserOutput);
    });
  });

  describe("updateUser", () => {
    test("iD와 사용자 데이터를 입력하면, 사용자를 수정하고 데이터를 반환해야 한다.", async () => {
      // Given
      const { userOutput } = await createFakeUser();
      const newUserInput: UserInput = createFakeUserInput();

      // When
      const result = await userService.updateUser(userOutput.id, newUserInput);

      // Then
      const expectedUserOutput = getExpectedUserOutput(newUserInput);

      expect(result).toStrictEqual(expectedUserOutput);
    });
  });

  describe("deleteUser", () => {
    test("iD를 입력하면, 사용자를 삭제하고 데이터를 반환해야 한다.", async () => {
      // Given
      const { userInput, userOutput } = await createFakeUser();

      // When
      const result = await userService.deleteUser(userOutput.id);

      // Then
      const expectedUserOutput = getExpectedUserOutput(userInput);

      expect(result).toStrictEqual(expectedUserOutput);
    });
  });
});
