FROM mariadb:11.4.3-noble

# 초기화 쉘 스크립트를 이미지에 복사
COPY init.sh /docker-entrypoint-initdb.d/

# 초기화 쉘 스크립트에 실행 권한 부여
RUN chmod +x /docker-entrypoint-initdb.d/init.sh