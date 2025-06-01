#!/bin/sh
set -e

# SSL 인증서 존재 여부 확인
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]; then
  echo "SSL 인증서가 존재합니다. HTTPS 설정을 활성화합니다."
  envsubst '$DOMAIN $FRONTEND_PORT $BACKEND_PORT' </etc/nginx/nginx-https.conf >/etc/nginx/nginx.conf
else
  echo "SSL 인증서가 없습니다. HTTP 전용 설정으로 시작합니다."
  envsubst '$DOMAIN $FRONTEND_PORT $BACKEND_PORT' </etc/nginx/nginx-http.conf >/etc/nginx/nginx.conf
fi

# nginx 설정 테스트
nginx -t

exec nginx -g 'daemon off;'
