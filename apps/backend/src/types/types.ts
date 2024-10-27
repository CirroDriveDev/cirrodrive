import { type Session, type User } from "@prisma/client";

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
