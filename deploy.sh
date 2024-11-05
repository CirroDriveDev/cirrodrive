#!/bin/bash

# 원격 디렉토리 생성
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "mkdir -p ${DEPLOY_PATH}"
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "mkdir -p ${DEPLOY_PATH}/apps/database"

# 파일 전송
scp -o StrictHostKeyChecking=no ./cirrodrive-frontend.tar "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
scp -o StrictHostKeyChecking=no ./cirrodrive-backend.tar "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
scp -o StrictHostKeyChecking=no ./cirrodrive-database.tar "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"

# Docker 이미지 로드
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "docker load -i ${DEPLOY_PATH}/cirrodrive-frontend.tar"
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "docker load -i ${DEPLOY_PATH}/cirrodrive-backend.tar"
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "docker load -i ${DEPLOY_PATH}/cirrodrive-database.tar"

# compose 파일 전송
scp -o StrictHostKeyChecking=no ./compose.yaml "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
scp -o StrictHostKeyChecking=no ./apps/database/compose.yaml "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"

# 도커 컴포즈 실행
ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" <<EOF
export DATABASE_DATA_PATH="${DATABASE_DATA_PATH}"
export MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD}"
export MARIADB_USER="${MARIADB_USER}"
export MARIADB_PASSWORD="${MARIADB_PASSWORD}"
export MARIADB_HOST="${MARIADB_HOST}"
export MARIADB_PORT="${MARIADB_PORT}"
export DATABASE_URL="${DATABASE_URL}"
docker-compose -f ${DEPLOY_PATH}/compose.yaml up -d --remove-orphans --renew-anon-volumes ${FRONTEND_CONTAINER_NAME} ${BACKEND_CONTAINER_NAME} ${DATABASE_CONTAINER_NAME}
EOF
