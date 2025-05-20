import type { User, Session } from "@cirrodrive/database/prisma";

declare module "express" {
  interface Request {
    user?: User;
    session?: Session;
    sessionToken?: string;
  }
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
