FROM nginx:alpine AS runner

# Nginx 설정 복사
COPY /apps/frontend/nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 웹사이트를 Nginx의 정적 파일 제공 디렉토리로 복사
COPY /apps/frontend/dist /usr/share/nginx/html

# 실행 명령어
CMD ["nginx", "-g", "daemon off;"]
