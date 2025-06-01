# 베이스 이미지 설정 - Node.js 환경
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

# 모노레포 프루닝을 위한 빌더 단계
FROM base AS pruner

# 모노레포 전체 구조 복사
COPY . .

# frontend 앱에 필요한 파일만 추출
RUN turbo prune @cirrodrive/frontend --docker

# 빌드 단계
FROM base AS builder
WORKDIR /cirrodrive

# 개발 의존성 설치
COPY --from=pruner /cirrodrive/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts --force

# 소스 코드 복사
COPY --from=pruner /cirrodrive/out/full/ .

# 프론트엔드 빌드
RUN --mount=type=secret,id=VITE_API_HOST,env=VITE_API_HOST \
  --mount=type=secret,id=VITE_API_PORT,env=VITE_API_PORT \
  --mount=type=secret,id=VITE_TOSS_CLIENT_KEY,env=VITE_TOSS_CLIENT_KEY \
  pnpm turbo run build --filter=@cirrodrive/frontend...;

# 프로덕션 배포를 위한 Nginx 설정
FROM nginx:alpine AS runner

# Nginx 설정 복사
COPY --from=builder /cirrodrive/apps/frontend/nginx.conf /etc/nginx/nginx.conf.template

# entrypoint 스크립트 복사
COPY --from=builder /cirrodrive/apps/frontend/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 빌드된 정적 웹사이트를 Nginx의 정적 파일 제공 디렉토리로 복사
COPY --from=builder /cirrodrive/apps/frontend/dist /usr/share/nginx/html

# 헬스체크를 위한 curl 설치
RUN apk add --no-cache curl

# 포트 설정 (기본값으로 80 사용, 런타임에 환경변수로 변경 가능)
EXPOSE 80

# 실행 명령어
ENTRYPOINT ["/docker-entrypoint.sh"]
