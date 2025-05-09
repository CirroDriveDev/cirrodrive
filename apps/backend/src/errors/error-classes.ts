import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

/**
 * Name: AppError
 *
 * Code: internal_server_error
 *
 * Description: 모든 사용자 정의 오류의 기본 클래스입니다. tRPC 에러 코드와 상세 정보를 포함합니다.
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: TRPC_ERROR_CODE_KEY = "INTERNAL_SERVER_ERROR",
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Name: NotFoundError
 *
 * Code: NOT_FOUND
 *
 * Description: 리소스를 찾을 수 없을 때 사용합니다. 예: 파일, 사용자, 엔트리 등
 */
export class NotFoundError extends AppError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(`${resource} not found`, "NOT_FOUND", details);
  }
}

/**
 * Name: PermissionDeniedError
 *
 * Code: FORBIDDEN
 *
 * Description: 사용자가 특정 작업을 수행할 권한이 없을 때 사용합니다. 예: 다른 사용자의 파일 접근 시
 */
export class PermissionDeniedError extends AppError {
  constructor(action: string, details?: Record<string, unknown>) {
    super(`Permission denied to ${action}`, "FORBIDDEN", details);
  }
}

/**
 * Name: ConflictError
 *
 * Code: CONFLICT
 *
 * Description: 중복된 리소스나 이름 충돌이 발생했을 때 사용합니다. 예: 같은 이름의 파일 생성 시
 */
export class ConflictError extends AppError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super(`Conflict: ${reason}`, "CONFLICT", details);
  }
}

/**
 * Name: ValidationError
 *
 * Code: BAD_REQUEST
 *
 * Description: 잘못된 입력 값에 대해 사용합니다. 예: 필수 필드 누락, 형식 오류 등
 */
export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: Record<string, unknown>) {
    super(message, "BAD_REQUEST", details);
  }
}

/**
 * Name: UnauthorizedError
 *
 * Code: UNAUTHORIZED
 *
 * Description: 인증되지 않은 사용자의 요청에 사용합니다. 예: 로그인하지 않은 접근 시
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(message, "UNAUTHORIZED", details);
  }
}
