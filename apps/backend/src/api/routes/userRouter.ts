import { Router, type Request, type Response } from "express";
import {
  createUserRequestBodySchema,
  createUserResponseBodySchema,
  getUsersQuerySchema,
  getUsersResponseBodySchema,
  getUserParamSchema,
  getUserResponseBodySchema,
  updateUserParamSchema,
  updateUserRequestBodySchema,
  updateUserResponseBodySchema,
  deleteUserParamSchema,
  type CreateUserResponseBody,
  type GetUsersResponseBody,
  type GetUserResponseBody,
  type UpdateUserParam,
  type UpdateUserRequestBody,
  type UpdateUserResponseBody,
  type DeleteUserParam,
} from "@cirrodrive/types";
import { StatusCodes } from "http-status-codes";
import { container } from "@/loaders/inversify.ts";
import { UserService } from "@/services/userService.ts";
import { logger } from "@/loaders/logger.ts";

/**
 * 사용자 라우터입니다.
 */
export const UserRouter = (): Router => {
  const router = Router();
  const userService = container.get<UserService>(UserService);

  // createUser
  router.post("/", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "createUser 요청 시작");

    // Authorization
    if (req.user) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "이미 로그인되어 있습니다.",
      });
      return;
    }

    // Input
    const { data: requestBody, success } =
      createUserRequestBodySchema.safeParse(req.body);

    if (!success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "잘못된 요청입니다.",
      });
      return;
    }

    // Process
    const user = await userService.createUser(requestBody);

    // Output
    const responseBody: CreateUserResponseBody =
      createUserResponseBodySchema.parse(user);
    res.status(StatusCodes.CREATED).json(responseBody);
  });

  // getUsers
  router.get("/", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "getUsers 요청 시작");

    // Input
    const query = getUsersQuerySchema.parse(req.query);

    // Process
    const users: GetUsersResponseBody = await userService.getUsers(
      query.limit,
      query.offset,
    );

    // Output
    const responseBody: GetUsersResponseBody =
      getUsersResponseBodySchema.parse(users);
    res.status(StatusCodes.OK).json(responseBody);
  });

  // getUser
  router.get("/:username", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "getUser 요청 시작");

    // Authorization
    if (!req.user || req.user.username !== req.params.username) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }

    // Input
    const { data: params, success } = getUserParamSchema.safeParse(req.params);

    if (!success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "잘못된 요청입니다.",
      });
      return;
    }

    // Process
    const user: GetUserResponseBody = await userService.getUser(
      params.username,
    );

    if (req.user.username !== params.username) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }

    // Output
    const responseBody: GetUserResponseBody =
      getUserResponseBodySchema.parse(user);
    res.status(StatusCodes.OK).json(responseBody);
  });

  // updateUser
  router.put("/:username", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "updateUser 요청 시작");

    // Authorization
    if (!req.user || req.user.username !== req.params.username) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }

    // Input
    const { username }: UpdateUserParam = updateUserParamSchema.parse(
      req.params,
    );
    const data: UpdateUserRequestBody = updateUserRequestBodySchema.parse(
      req.body,
    );

    // Process
    const user: UpdateUserResponseBody = await userService.updateUser(
      username,
      data,
    );

    // Output
    const responseBody: UpdateUserResponseBody =
      updateUserResponseBodySchema.parse(user);
    res.status(StatusCodes.OK).json(responseBody);
  });

  // deleteUser
  router.delete("/:username", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "deleteUser 요청 시작");

    // Authorization
    if (!req.user || req.user.username !== req.params.username) {
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }

    // Input
    const { username }: DeleteUserParam = deleteUserParamSchema.parse(
      req.params,
    );

    // Process
    await userService.deleteUser(username);

    // Output
    res.status(StatusCodes.NO_CONTENT).send();
  });

  return router;
};
