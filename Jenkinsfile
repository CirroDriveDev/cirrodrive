pipeline {
    agent any

    tools {
        nodejs 'NodeJS_LTS'
    }

    environment {
        TURBO_TELEMETRY_DISABLED = 1
        PNPM_HOME = '/pnpm'
        MAIN = 'main'
        DEVELOP = 'develop'

        // 데이터베이스
        DATABASE_DATA_PATH = '/home/ec2-user/cirrodrive'
        MARIADB_ROOT_PASSWORD = credentials('MARIADB_ROOT_PASSWORD_CREDENTIAL_ID')
        MARIADB_USER = credentials('MARIADB_USER_CREDENTIAL_ID')
        MARIADB_PASSWORD = credentials('MARIADB_PASSWORD_CREDENTIAL_ID')
        MARIADB_HOST = 'localhost'
        MARIADB_PORT = '3307'

        // API 서버
        APP_DATA_PATH = '/home/ec2-user/cirrodrive'
        VITE_API_SERVER_URL = credentials('EC2_EXTERNAL_URL_ID')
    }

    stages {
        stage('Set environment variables') {
            steps {
                echo 'Setting environment variables...'
                script {
                    if (env.BRANCH_NAME == MAIN) {
                        env.MARIADB_DATABASE = 'cirrodrive_prod'
                    } else {
                        env.MARIADB_DATABASE = 'cirrodrive_dev'
                    }
                    /* groovylint-disable-next-line LineLength */
                    env.DATABASE_URL = "mysql://${env.MARIADB_USER}:${env.MARIADB_PASSWORD}@${env.MARIADB_HOST}:${env.MARIADB_PORT}/${env.MARIADB_DATABASE}"
                }
            }
        }

        stage('Set up pnpm') {
            steps {
                echo 'Setting up pnpm...'
                script {
                    env.PATH = "${PNPM_HOME}:${PATH}"
                }
                sh 'corepack enable pnpm'
            }
        }

        stage('Install dependency') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Start development database') {
            steps {
                echo 'Starting development database...'
                script {
                    // .env 파일 생성
                    def envFileContent = """
                    DATABASE_DATA_PATH=${env.DATABASE_DATA_PATH}
                    MARIADB_ROOT_PASSWORD=${env.MARIADB_ROOT_PASSWORD}
                    MARIADB_USER=${env.MARIADB_USER}
                    MARIADB_PASSWORD=${env.MARIADB_PASSWORD}
                    MARIADB_PORT=${env.MARIADB_PORT}
                    DATABASE_URL=${env.DATABASE_URL}
                    """.stripIndent()

                    writeFile file: './apps/database/.env', text: envFileContent
                }
                sh 'pnpm run db:dev'
                sh 'socat TCP-LISTEN:3307,fork TCP:docker:3307 &'
            }
        }

        stage('Generate prisma client') {
            steps {
                echo 'Generating Prisma client...'
                sh 'pnpm run db:generate'
            }
        }

        stage('DB push') {
            steps {
                echo 'Push prisma schema to database...'
                sh 'pnpm run db:push'
            }
        }

        stage('Type check') {
            steps {
                echo 'Running typecheck...'
                sh 'pnpm run typecheck'
            }
        }

        stage('Test') {
            steps {
                echo 'Running vitest...'
                sh 'pnpm run test -- run'
            }
        }

        stage('Build') {
            steps {
                script {
                    if (env.BRANCH_NAME == MAIN) {
                        echo 'Building in production...'
                        env.VITE_PORT = '8000'
                        env.VITE_API_SERVER_PORT = "${VITE_PORT}"
                        sh 'pnpm run build'
                    } else {
                        echo 'Building in development...'
                        env.NODE_ENV = 'development'
                        env.VITE_PORT = '3000'
                        env.VITE_API_SERVER_PORT = "${VITE_PORT}"
                        sh 'pnpm run build:dev'
                    }
                }
            }
        }

        stage('Build Docker image') {
            // when {
            //     anyOf {
            //         branch MAIN
            //         branch DEVELOP
            //     }
            // }
            steps {
                echo 'Building Docker image...'
                sh 'pnpm run docker:build'
            }
        }

        stage('Save Docker image') {
            // when {
            //     anyOf {
            //         branch MAIN
            //         branch DEVELOP
            //     }
            // }
            steps {
                echo 'Saving Docker image...'
                sh "docker save -o ./cirrodrive-frontend.tar \
                    cirrodrive-frontend:latest"
                sh "docker save -o ./cirrodrive-backend.tar \
                    cirrodrive-backend:latest"
                sh "docker save -o ./cirrodrive-database.tar \
                    cirrodrive-database:latest"
            }
        }

        stage('Deploy') {
            // when {
            //     anyOf {
            //         branch MAIN
            //         branch DEVELOP
            //     }
            // }
            environment {
                SSH_CREDS = credentials('EC2_SSH_CREDENTIAL_ID')
                DEPLOY_PATH = '/home/ec2-user/cirrodrive/deploy'
            }
            steps {
                script {
                    if (env.BRANCH_NAME == MAIN) {
                        echo 'Deploying to production...'
                    } else if (env.BRANCH_NAME == DEVELOP) {
                        echo 'Deploying to development...'
                    }
                    sshagent(credentials: ['EC2_SSH_CREDENTIAL_ID']) {
                        sh  "ssh -o StrictHostKeyChecking=no ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} mkdir -p ${DEPLOY_PATH}"
                        sh  "ssh -o StrictHostKeyChecking=no ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} mkdir -p ${DEPLOY_PATH}/apps/database"
                        sh  "scp -o StrictHostKeyChecking=no ./cirrodrive-frontend.tar ${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
                        sh  "scp -o StrictHostKeyChecking=no ./cirrodrive-backend.tar ${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
                        sh  "scp -o StrictHostKeyChecking=no ./cirrodrive-database.tar ${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
                        sh  "ssh -o StrictHostKeyChecking=no \
                                ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} \
                                docker load -i ${DEPLOY_PATH}/cirrodrive-frontend.tar"
                        sh  "ssh -o StrictHostKeyChecking=no \
                                ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} \
                                docker load -i ${DEPLOY_PATH}/cirrodrive-backend.tar"
                        sh  "ssh -o StrictHostKeyChecking=no \
                                ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} \
                                docker load -i ${DEPLOY_PATH}/cirrodrive-database.tar"
                        sh  "scp -o StrictHostKeyChecking=no ./compose.yaml ${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
                        sh  "scp -o StrictHostKeyChecking=no ./apps/database/compose.yaml ${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"
                        if (env.BRANCH_NAME == MAIN) {
                            sh  "ssh -o StrictHostKeyChecking=no \
                                    ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} \
                                    \"export DATABASE_DATA_PATH=${DATABASE_DATA_PATH} && \
                                    export MARIADB_ROOT_PASSWORD=${MARIADB_ROOT_PASSWORD} && \
                                    export MARIADB_USER=${MARIADB_USER} && \
                                    export MARIADB_PASSWORD=${MARIADB_PASSWORD} && \
                                    export MARIADB_HOST=${MARIADB_HOST} && \
                                    export MARIADB_PORT=${MARIADB_PORT} && \
                                    export DATABASE_URL=${DATABASE_URL} && \
                                    docker-compose -f ${DEPLOY_PATH}/compose.yaml up -d --remove-orphans --renew-anon-volumes frontend backend database\""
                        } else {
                            sh  "ssh -o StrictHostKeyChecking=no \
                                    ${SSH_CREDS_USR}@${EC2_PRIVATE_IP} \
                                    \"export DATABASE_DATA_PATH=${DATABASE_DATA_PATH} && \
                                    export MARIADB_ROOT_PASSWORD=${MARIADB_ROOT_PASSWORD} && \
                                    export MARIADB_USER=${MARIADB_USER} && \
                                    export MARIADB_PASSWORD=${MARIADB_PASSWORD} && \
                                    export MARIADB_HOST=${MARIADB_HOST} && \
                                    export MARIADB_PORT=${MARIADB_PORT} && \
                                    export DATABASE_URL=${DATABASE_URL} && \
                                    docker-compose -f ${DEPLOY_PATH}/compose.yaml up -d --remove-orphans --renew-anon-volumes frontend-dev backend-dev database\""
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            sh 'pnpm run -F @cirrodrive/database stop'
            cleanWs(deleteDirs: true)
        }
    }
}
