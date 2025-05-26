FROM node:20.19.1-alpine AS base
WORKDIR /cirrodrive

# 환경 변수 설정
ENV TURBO_TELEMETRY_DISABLED=1

# pnpm 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Turbo 설치
RUN pnpm add -g turbo@^2

# 모노레포 전체 구조 복사
COPY . .

# 빌드 단계

# 개발 의존성 설치
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts --force

# 모든 필요한 패키지 빌드
RUN pnpm turbo run build --filter @cirrodrive/backend...

# 실행 환경 설정 
ENV NODE_ENV=production

# 헬스체크를 위한 curl 설치
RUN apk add --no-cache curl

CMD [ "pnpm", "run", "-F", "@cirrodrive/backend", "start"]


