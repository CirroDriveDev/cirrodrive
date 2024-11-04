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

        // 배포
        DOCKER_HOST_IP = credentials('EC2_SSH_INTERNAL_IP_ID')
        SSH_CREDS = credentials('EC2_SSH_CREDENTIAL_ID')
        DEPLOY_PATH = '/home/ec2-user/cirrodrive/deploy'
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
                echo "DATABASE_URL: ${env.DATABASE_URL}"
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

        stage('Build in production') {
            when {
                branch MAIN
            }
            environment {
                VITE_PORT = '8000'
                VITE_API_SERVER_PORT = "${VITE_PORT}"
            }
            steps {
                echo 'Building in production...'
                sh 'pnpm run build'
            }
        }

        stage('Build in development') {
            environment {
                NODE_ENV = 'development'
                VITE_PORT = '3000'
                VITE_API_SERVER_PORT = "${VITE_PORT}"
            }
            steps {
                echo 'Building in development...'
                sh 'pnpm run build:dev'
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
            steps {
                script {
                    if (env.BRANCH_NAME == MAIN) {
                        echo 'Deploying to production...'
                    } else if (env.BRANCH_NAME == DEVELOP) {
                        echo 'Deploying to development...'
                    }
                    sh  '''
                        scp -i $SSH_CREDS \
                            ./cirrodrive-frontend.tar \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP}:${DEPLOY_PATH}/

                        scp -i $SSH_CREDS \
                            ./cirrodrive-backend.tar \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP}:${DEPLOY_PATH}/

                        scp -i $SSH_CREDS \
                            ./cirrodrive-database.tar \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP}:${DEPLOY_PATH}/

                        scp -i $SSH_CREDS \
                            ./cirrodrive-database.tar \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP}:${DEPLOY_PATH}/

                        ssh -i $SSH_CREDS \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP} \
                            "export MARIADB_USER=${MARIADB_USER} && \
                             export MARIADB_PASSWORD=${MARIADB_PASSWORD} && \
                             export MARIADB_HOST=${MARIADB_HOST} && \
                             export MARIADB_PORT=${MARIADB_PORT} && \
                             export DATABASE_URL=${DATABASE_URL} && \
                             docker load -i ${DEPLOY_PATH}/cirrodrive-frontend.tar && \
                             docker load -i ${DEPLOY_PATH}/cirrodrive-backend.tar && \
                             docker load -i ${DEPLOY_PATH}/cirrodrive-database.tar && \
                             cd ${DEPLOY_PATH}
                        '''
                    if (env.BRANCH_NAME == MAIN) {
                        sh  '''
                            ssh -i $SSH_CREDS \
                                ${SSH_CREDS_USR}@${DOCKER_HOST_IP} \
                                docker-compose up -d --remove-orphans --renew-anon-volumes frontend backend database
                            '''
                    } else if (env.BRANCH_NAME == DEVELOP) {
                        sh  '''
                            ssh -i $SSH_CREDS \
                            ${SSH_CREDS_USR}@${DOCKER_HOST_IP} \
                            docker-compose up -d --remove-orphans --renew-anon-volumes frontend-dev backend-dev database
                            '''
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            sh 'docker logs --tail 1000 database'
            sh 'pnpm run -F @cirrodrive/database stop'
            cleanWs(deleteDirs: true)
        }
    }
}
