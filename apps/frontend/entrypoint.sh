#!/bin/sh

# 기본값 설정
FRONTEND_PORT=${FRONTEND_PORT:-80}

# 환경변수로 nginx.conf 템플릿 처리
envsubst '$FRONTEND_PORT' </etc/nginx/nginx.conf.template >/etc/nginx/nginx.conf

# nginx 시작
exec nginx -g "daemon off;"
