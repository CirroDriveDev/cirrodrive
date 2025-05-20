import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import { AppError } from "./error-classes.js";

export class DBError extends AppError {
  constructor(
    message: string,
    code: TRPC_ERROR_CODE_KEY = "INTERNAL_SERVER_ERROR",
    details?: Record<string, unknown>,
  ) {
    super(message, code, details, "db");
  }
}

export class DBNotFoundError extends DBError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(`${resource} not found in DB`, "NOT_FOUND", details);
  }
}

export class DBUniqueConstraintError extends DBError {
  constructor(
    message = "Unique constraint violation",
    details?: Record<string, unknown>,
  ) {
    super(message, "CONFLICT", details);
  }
}

export class DBForeignKeyError extends DBError {
  constructor(
    message = "Foreign key constraint violation",
    details?: Record<string, unknown>,
  ) {
    super(message, "BAD_REQUEST", details);
  }
}

export class DBTransactionError extends DBError {
  constructor(
    message = "Database transaction error",
    details?: Record<string, unknown>,
  ) {
    super(message, "INTERNAL_SERVER_ERROR", details);
  }
}
