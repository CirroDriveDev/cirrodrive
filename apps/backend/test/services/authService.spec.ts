import { faker } from "@faker-js/faker";
import { createFakeUserInput } from "test/utils/createFakeInput.ts";
import { createFakeUser } from "test/utils/createFakeObject.ts";
import {
  getExpectedSessionOutput,
  getExpectedUserOutput,
} from "test/utils/getExpectedOutput.ts";
import { prisma } from "@/loaders/prisma.ts";
import { container } from "@/loaders/inversify.ts";
import { AuthService } from "@/services/authService.ts";

describe("authService", () => {
  const authService: AuthService = container.get(AuthService);

  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  beforeEach(async () => {
    await prisma.session.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("login", () => {
    test("사용자가 존재하면, 세션을 생성하고 사용자 정보를 반환해야 한다.", async () => {
      // Given
      const { userInput, userOutput } = await createFakeUser();
      const { username, password } = userInput;

      // When
      const result = await authService.login(username, password);

      // Then
      const expectedSession = getExpectedSessionOutput(userOutput.id, true);

      expect(result).toEqual(expectedSession);
    });

    test("사용자가 존재하지 않으면, 에러를 반환해야 한다.", async () => {
      // Given
      const userInput = createFakeUserInput();
      const { username, password } = userInput;

      // When
      const result = authService.login(username, password);

      // Then
      await expect(result).rejects.toThrowError();
    });
  });

  describe("logout", () => {
    test("세션이 존재하면, 세션을 삭제해야 한다.", async () => {
      // Given
      const userInput = createFakeUserInput();
      const createdUser = await prisma.user.create({
        data: userInput,
      });
      const session = await prisma.session.create({
        data: {
          id: faker.string.uuid(),
          userId: createdUser.id,
          expiresAt: faker.date.soon(),
        },
      });

      // When
      const result = authService.logout(session.id);

      // Then
      await expect(result).resolves.toBeUndefined();
    });

    test("세션이 존재하지 않으면, 에러를 반환해야 한다.", async () => {
      // Given
      const sessionId = faker.string.uuid();

      // When
      const result = authService.logout(sessionId);

      // Then
      await expect(result).rejects.toThrowError();
    });
  });

  describe("validateSession", () => {
    test("세션이 존재하면, 사용자 정보와 세션 정보를 반환해야 한다.", async () => {
      // Given
      const { userInput, userOutput } = await createFakeUser();
      const session = await authService.login(
        userInput.username,
        userInput.password,
      );

      // When
      const result = await authService.validateSession(session.id);

      // Then
      const expectedUser = getExpectedUserOutput(userInput);
      const expectedSession = getExpectedSessionOutput(userOutput.id, false);

      expect(result.user).toEqual(expectedUser);
      expect(result.session).toEqual(expectedSession);
    });

    test("세션의 만료 시간이 지났으면, 에러를 반환해야 한다.", async () => {
      // Given
      const userInput = createFakeUserInput();
      const createdUser = await prisma.user.create({
        data: userInput,
      });
      const session = await prisma.session.create({
        data: {
          id: faker.string.uuid(),
          userId: createdUser.id,
          expiresAt: faker.date.past(),
        },
      });

      // When
      const result = authService.validateSession(session.id);

      // Then
      await expect(result).rejects.toThrowError();
    });

    test("세션이 존재하지 않으면, 에러를 반환해야 한다.", async () => {
      // Given
      const sessionId = faker.string.uuid();

      // When
      const result = authService.validateSession(sessionId);

      // Then
      await expect(result).rejects.toThrowError();
    });
  });
});
