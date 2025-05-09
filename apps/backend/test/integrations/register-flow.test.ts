import { clearDatabase } from "test/test-utils/prisma-utils";
import { container } from "@/loaders/inversify.loader.ts";
import { UserService } from "@/services/user.service.ts";
import { EmailService } from "@/services/email.service.ts";

describe("Register flow", () => {
  const userService = container.get<UserService>(UserService);
  const emailService = container.get<EmailService>(EmailService);

  beforeAll(async () => {
    await clearDatabase();
  });

  test("should allow register with valid code", async () => {
    const email = "test@cirro.io";
    const token = await emailService.verifyEmailCode(email, "123456");

    const user = await userService.create({
      data: {
        username: "test",
        email,

        password: "pass",
      },
      token,
    });

    expect(user).toMatchObject({ email });
  });
});
