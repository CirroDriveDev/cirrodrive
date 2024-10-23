import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { container } from "@/loaders/inversify.ts";
import { AuthService } from "@/services/authService.ts";

const authService = container.get<AuthService>(AuthService);
export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { data: token, success } = z.string().safeParse(req.cookies.session);

  if (!success) {
    next();
    return;
  }

  const { session, user } = await authService.validateSessionToken(token);

  if (!session) {
    authService.deleteSessionTokenCookie(res);
    next();
    return;
  }

  req.user = user;
  req.session = session;
  req.sessionToken = token;
  authService.setSessionTokenCookie(res, token, session.expiresAt);
  next();
}
