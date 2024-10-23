import request from "supertest";
import {
  createUserResponseBodySchema,
  type GetUsersResponseBody,
  type CreateUserRequestBody,
  type CreateUserResponseBody,
  getUsersResponseBodySchema,
  type GetUsersQuery,
} from "@cirrodrive/types";
import { prisma } from "@/loaders/prisma.ts";
import { expressLoader } from "@/loaders/express.ts";

const app = expressLoader();

describe("userAPI", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe("createUser", () => {
    test("createUser", async () => {
      // Given
      const createUserRequest: CreateUserRequestBody = {
        username: "testuser",
        password: "password",
        email: "test@example.com",
      };

      const expectedUser: CreateUserResponseBody = {
        id: expect.any(Number) as number,
        username: "testuser",
        email: "test@example.com",
        pricingPlan: "free",
        usedStorage: 0,
        profileImageUrl: null,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      };

      // When
      const response = await request(app)
        .post("/api/v1/users")
        .send(createUserRequest);

      // Then
      expect(response.status).toBe(201);
      const user = createUserResponseBodySchema.parse(response.body);
      expect(user).toStrictEqual(expectedUser);
    });
  });

  test("getUsers", async () => {
    // Given
    const getUsersQuery: GetUsersQuery = { limit: 10, offset: 0 };
    const expectedUsers: GetUsersResponseBody = [];

    // When
    const response = await request(app)
      .get("/api/v1/users")
      .query(getUsersQuery);

    // Then
    expect(response.status).toBe(200);
    const users = getUsersResponseBodySchema.parse(response.body);
    expect(users).toStrictEqual(expectedUsers);
  });

  describe("getUser", () => {
    test("authorized user", async () => {
      // Given
      await request(app).post("/api/v1/users").send({
        username: "testuser",
        password: "password",
        email: "test@example.com",
      });

      const agent = request.agent(app);
      await agent.post("/api/v1/sessions").send({
        username: "testuser",
        password: "password",
      });

      // When
      const response = await agent.get("/api/v1/users/testuser");

      // Then
      expect(response.status).toBe(200);
      const user = createUserResponseBodySchema.parse(response.body);
      expect(user.username).toBe("testuser");
    });

    test("unauthorized user", async () => {
      // Given
      await request(app).post("/api/v1/users").send({
        username: "testuser",
        password: "password",
        email: "test@example.com",
      });

      // When
      const response = await request(app).get("/api/v1/users/testuser");

      // Then
      expect(response.status).toBe(401);
    });
  });
});
