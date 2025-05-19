FROM node:20.18

# 환경 변수 설정
ENV TURBO_TELEMETRY_DISABLED=1

# pnpm 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable

# 작업 디렉터리 설정
WORKDIR /cirrodrive

# 모노레포 복사
COPY . .

# 의존성 설치
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts

# 실행 명령어
CMD [ "pnpm", "-F", "@cirrodrive/backend", "run", "start" ]
