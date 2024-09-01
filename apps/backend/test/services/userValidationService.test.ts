import { faker } from "@faker-js/faker";
import { createFakeUserInput } from "test/utils/createFakeInput.ts";
import { container } from "@/loaders/inversify.ts";
import { type UserInput } from "@/types/dto.ts";
import { UserValidationService } from "@/services/userValidationService.ts";

describe("userValidatorService", () => {
  const userValidatorService: UserValidationService = container.get(
    UserValidationService,
  );

  describe("validateUserInput", () => {
    test("유효한 사용자 데이터가 입력되면, true를 반환해야 한다.", () => {
      // Given
      const count = 1000;
      const userInputs: UserInput[] = [];
      for (let i = 0; i < count; i++) {
        userInputs.push(createFakeUserInput());
      }

      // When
      const results = [];
      for (let i = 0; i < count; i++) {
        const userInput = userInputs[i];
        if (!userInput) {
          continue;
        }

        results.push(userValidatorService.validateUserInput(userInput));
      }

      // Then
      expect(results).toStrictEqual(userInputs.map(() => true));
    });
  });

  describe("validateUsername", () => {
    test("유효한 사용자 이름이 입력되면, true를 반환해야 한다.", () => {
      // Given
      const count = 1000;
      const usernames = [];
      for (let i = 0; i < count; i++) {
        usernames.push(faker.internet.userName());
      }

      // When
      const results = [];
      for (let i = 0; i < count; i++) {
        const username = usernames[i];
        if (!username) {
          continue;
        }

        results.push(userValidatorService.validateUsername(username));
      }

      // Then
      expect(results).toStrictEqual(usernames.map(() => true));
    });

    test("허용되지 않은 문자를 포함한 사용자 이름이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const username = faker.string.fromCharacters("한글!@#$%^&*()");

      // When
      const result = userValidatorService.validateUsername(username);

      // Then
      expect(result).toBe(false);
    });

    test("길이 2 이하의 사용자 이름이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const username = faker.string.alphanumeric(2);

      // When
      const result = userValidatorService.validateUsername(username);

      // Then
      expect(result).toBe(false);
    });

    test("길이 65 이상의 사용자 이름이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const username = faker.string.alphanumeric(65);

      // When
      const result = userValidatorService.validateUsername(username);

      // Then
      expect(result).toBe(false);
    });
  });

  describe("validatePassword", () => {
    test("유효한 비밀번호가 입력되면, true를 반환해야 한다.", () => {
      // Given
      const count = 1000;
      const passwords = [];
      for (let i = 0; i < count; i++) {
        passwords.push(faker.internet.password());
      }

      // When
      const results = [];
      for (let i = 0; i < count; i++) {
        const password = passwords[i];
        if (!password) {
          continue;
        }

        results.push(userValidatorService.validatePassword(password));
      }

      // Then
      expect(results).toStrictEqual(passwords.map(() => true));
    });

    test("길이 7 이하의 비밀번호가 입력되면, false를 반환해야 한다.", () => {
      // Given
      const password = faker.string.sample(7);

      // When
      const result = userValidatorService.validatePassword(password);

      // Then
      expect(result).toBe(false);
    });

    test("길이 65 이상의 비밀번호가 입력되면, false를 반환해야 한다.", () => {
      // Given
      const password = faker.string.sample(65);

      // When
      const result = userValidatorService.validatePassword(password);

      // Then
      expect(result).toBe(false);
    });
  });

  describe("validateEmail", () => {
    test("유효한 이메일이 입력되면, true를 반환해야 한다.", () => {
      // Given
      const count = 1000;
      const emails = [];
      for (let i = 0; i < count; i++) {
        emails.push(faker.internet.email());
      }

      // When
      const results = [];
      for (let i = 0; i < count; i++) {
        const email = emails[i];
        if (!email) {
          continue;
        }

        results.push(userValidatorService.validateEmail(email));
      }

      // Then
      expect(results).toStrictEqual(emails.map(() => true));
    });

    test("유효하지 않은 이메일이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const email = faker.internet.userName();

      // When
      const result = userValidatorService.validateEmail(email);

      // Then
      expect(result).toBe(false);
    });
  });

  describe("validateNickname", () => {
    test("유효한 닉네임이 입력되면, true를 반환해야 한다.", () => {
      // Given
      const count = 1000;
      const nicknames = [];
      for (let i = 0; i < count; i++) {
        nicknames.push(faker.internet.displayName());
      }

      // When
      const results = [];
      for (let i = 0; i < count; i++) {
        const nickname = nicknames[i];
        if (!nickname) {
          continue;
        }

        results.push(userValidatorService.validateNickname(nickname));
      }

      // Then
      expect(results).toStrictEqual(nicknames.map(() => true));
    });

    test("길이 1 이하의 닉네임이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const nickname = faker.string.sample(1);

      // When
      const result = userValidatorService.validateNickname(nickname);

      // Then
      expect(result).toBe(false);
    });

    test("길이 65 이상의 닉네임이 입력되면, false를 반환해야 한다.", () => {
      // Given
      const nickname = faker.string.sample(65);

      // When
      const result = userValidatorService.validateNickname(nickname);

      // Then
      expect(result).toBe(false);
    });
  });
});
