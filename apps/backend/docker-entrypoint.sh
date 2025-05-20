#!/bin/sh
# filepath: /workspace/cirrodrive/apps/backend/docker-entrypoint.sh
set -e

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
  echo "오류: DATABASE_URL 환경 변수가 설정되지 않았습니다."
  exit 1
fi

echo "데이터베이스 마이그레이션 시작..."
# 데이터베이스 마이그레이션 실행
pnpm run -F @cirrodrive/database ci:db:push

echo "데이터베이스 시드 실행..."
# 데이터베이스 시드 실행
pnpm run -F @cirrodrive/database ci:db:seed

echo "마이그레이션 및 시드 완료"

# 원래 명령 실행
echo "백엔드 서버 시작..."
exec "$@"
