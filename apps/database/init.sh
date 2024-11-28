#!/bin/bash
set -e

# cirrodrive_dev 데이터베이스 삭제
mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" <<-EOSQL
  DROP DATABASE IF EXISTS cirrodrive_dev;
EOSQL

# SQL 명령어 실행 (환경변수를 사용하여 사용자 생성 및 권한 부여)
mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" <<-EOSQL
  CREATE USER IF NOT EXISTS '${MARIADB_USER}'@'%' IDENTIFIED BY '${MARIADB_PASSWORD}';
  GRANT ALL PRIVILEGES ON *.* TO '${MARIADB_USER}'@'%' WITH GRANT OPTION;
  FLUSH PRIVILEGES;
EOSQL
