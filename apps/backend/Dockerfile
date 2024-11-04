# 기본 이미지 설정
FROM node:20.18 AS base

# socat 설치
RUN apt-get update && apt-get install -y socat

# pnpm 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 작업 디렉터리 설정
WORKDIR /cirrodrive



# 모노레포 정리
FROM base AS prune

# 환경 변수 설정
ENV TURBO_TELEMETRY_DISABLED=1

# turborepo 설치
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -g turbo

# 모노레포 복사
COPY . .

# 불필요한 파일 정리
RUN pnpx turbo prune @cirrodrive/backend --docker

# 결과 압축
RUN tar -czf json.tar.gz -C ./out/json . && \
  tar -czf full.tar.gz -C ./out/full .



# 의존성 설치
FROM base AS deps

# json 파일 복사
COPY --from=prune /cirrodrive/json.tar.gz .
RUN tar -xzf json.tar.gz -C . && rm json.tar.gz

# 의존성 설치
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=prune /cirrodrive/json.tar.gz .
RUN tar -xzf json.tar.gz -C . && rm json.tar.gz

# full 파일 복사
COPY --from=prune /cirrodrive/full.tar.gz .
RUN tar -xzf full.tar.gz -C . && rm full.tar.gz


# 실행 이미지 설정
FROM deps AS runner

# prisma client 복사
# COPY ./apps/backend/src/loaders/prisma /cirrodrive/apps/backend/src/loaders/prisma

# 빌드된 서버와 prisma 디렉토리 복사
COPY ./apps/backend/dist /cirrodrive/apps/backend/dist

# 실행 권한 추가
RUN chmod +x ./apps/backend/docker-entrypoint.sh

# 실행 명령어
ENTRYPOINT [ "sh", "./apps/backend/docker-entrypoint.sh" ]