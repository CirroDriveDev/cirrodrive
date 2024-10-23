import { Router, type Request, type Response } from "express";
import {
  type LoginRequestBody,
  type LoginResponseBody,
  loginRequestBodySchema,
  loginResponseBodySchema,
} from "@cirrodrive/types";
import { StatusCodes } from "http-status-codes";
import { container } from "@/loaders/inversify.ts";
import { logger } from "@/loaders/logger.ts";
import { AuthService } from "@/services/authService.ts";

/**
 * 세션 라우터입니다.
 */
export const SessionRouter = (): Router => {
  const router = Router();
  const authService = container.get(AuthService);

  // login
  router.post("/", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "login 요청 시작");

    // Authentication
    if (req.user) {
      const message = "이미 로그인되어 있습니다.";
      logger.info({ requestId: req.id }, message);
      res.status(StatusCodes.BAD_REQUEST).json({ message });
      return;
    }

    // Input
    const { username, password }: LoginRequestBody =
      loginRequestBodySchema.parse(req.body);

    // Process
    const { user, session, token } = await authService.login(
      username,
      password,
    );

    // Output
    authService.setSessionTokenCookie(res, token, session.expiresAt);
    const responseBody: LoginResponseBody = loginResponseBodySchema.parse(user);
    res.status(StatusCodes.OK).json(responseBody);
  });

  // logout
  router.delete("/", async (req: Request, res: Response) => {
    logger.info({ requestId: req.id }, "logout 요청 시작");

    // Authentication
    if (!req.sessionToken) {
      const message = "로그인되어 있지 않습니다.";
      logger.info({ requestId: req.id }, message);
      res.status(StatusCodes.BAD_REQUEST).json({ message });
      return;
    }

    // Process
    await authService.logout(req.sessionToken);

    // Output
    authService.deleteSessionTokenCookie(res);
    res.status(StatusCodes.NO_CONTENT).send();
  });

  return router;
};
