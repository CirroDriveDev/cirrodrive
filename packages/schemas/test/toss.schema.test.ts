import { TossBillingSchema } from "@cirrodrive/schemas/toss.js";
import { describe, test, expect } from "vitest";

describe("billingSchema", () => {
  test("정상적인 값은 에러를 발생시키지 않는다", () => {
    // arrange
    const validData = {
      mId: "tosspayments",
      customerKey: "aENcQAtPdYbTjGhtQnNVj",
      authenticatedAt: "2020-09-25T14:38:41+09:00",
      method: "카드",
      billingKey: "Z_t5vOvQxrj4499PeiJcjen28-V2RyqgYTwN44Rdzk0=",
      card: {
        issuerCode: "61",
        acquirerCode: "31",
        number: "12345678****123*",
        cardType: "신용",
        ownerType: "개인",
      },
      cardCompany: "현대",
      cardNumber: "12345678****123*",
    };

    const expectedParsedData = {
      mId: "tosspayments",
      customerKey: "aENcQAtPdYbTjGhtQnNVj",
      authenticatedAt: new Date("2020-09-25T14:38:41+09:00"),
      method: "카드",
      billingKey: "Z_t5vOvQxrj4499PeiJcjen28-V2RyqgYTwN44Rdzk0=",
      card: {
        issuerCode: "61",
        acquirerCode: "31",
        number: "12345678****123*",
        cardType: "신용",
        ownerType: "개인",
      },
      cardCompany: "현대",
      cardNumber: "12345678****123*",
    };

    // act
    const result = TossBillingSchema.safeParse(validData);

    // assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expectedParsedData);
  });

  test("잘못된 값은 에러를 발생시킨다", () => {
    // arrange
    const invalidData = {
      invalidField: "invalidValue",
    };

    // act
    const result = TossBillingSchema.safeParse(invalidData);

    // assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
