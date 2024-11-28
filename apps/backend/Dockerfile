# 기본 이미지 설정
FROM node:20.18 AS base

# 환경 변수 설정
ENV TURBO_TELEMETRY_DISABLED=1

# socat 설치
RUN apt-get update && apt-get install -y socat

# pnpm 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 작업 디렉터리 설정
WORKDIR /cirrodrive

# 모노레포 복사
COPY . .

# 의존성 설치
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts



# 백엔드 실행 이미지 설정
FROM base AS runner

# 실행 권한 추가
RUN chmod +x ./apps/backend/docker-entrypoint.sh

# 실행 명령어
ENTRYPOINT [ "sh", "./apps/backend/docker-entrypoint.sh" ]