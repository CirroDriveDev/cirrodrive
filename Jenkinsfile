/* groovylint-disable DuplicateStringLiteral, LineLength */
def createDatabaseUrl(String user, String password, String host, String port, String database) {
    return "mysql://${user}:${password}@${host}:${port}/${database}"
}

pipeline {
    agent any

    tools {
        nodejs 'NodeJS_LTS'
    }

    environment {
        TURBO_TELEMETRY_DISABLED = 1
        PNPM_HOME = '/pnpm'

        CIRRODRIVE_HOME = '~/cirrodrive'

        // 데이터베이스
        RDS_USER = credentials('RDS_USER_CREDENTIAL_ID')
        RDS_PASSWORD = credentials('RDS_PASSWORD_CREDENTIAL_ID')
        RDS_HOST = credentials('RDS_HOST_CREDENTIAL_ID')
        RDS_PORT = credentials('RDS_PORT_CREDENTIAL_ID')
        RDS_DATABASE = credentials('RDS_DATABASE_CREDENTIAL_ID')
        RDS_SHADOW_DATABASE = credentials('RDS_SHADOW_DATABASE_CREDENTIAL_ID')

        // 포트
        VITE_CLIENT_PORT = '80'
        VITE_SERVER_PORT = '8000'

        // API 서버
        VITE_EC2_PUBLIC_URL = "${EC2_PUBLIC_URL}"

        // 컨테이너 이름
        FRONTEND_CONTAINER_NAME = 'frontend'
        BACKEND_CONTAINER_NAME = 'backend'
    }

    stages {
        stage('Set environment variables') {
            steps {
                echo 'Setting environment variables...'
                script {
                    env.DATABASE_URL = createDatabaseUrl(
                        env.RDS_USER,
                        env.RDS_PASSWORD,
                        env.RDS_HOST,
                        env.RDS_PORT,
                        env.RDS_DATABASE
                    )
                    env.SHADOW_DATABASE_URL = createDatabaseUrl(
                        env.RDS_USER,
                        env.RDS_PASSWORD,
                        env.RDS_HOST,
                        env.RDS_PORT,
                        env.RDS_SHADOW_DATABASE
                    )
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

        stage('Generate prisma client') {
            steps {
                echo 'Generating Prisma client...'
                sh 'pnpm run db:generate'
            }
        }

        stage('DB push') {
            steps {
                echo 'Push prisma schema to database...'
                script {
                    // .env 파일 생성
                    def envFileContent = """
                    CIRRODRIVE_HOME=${CIRRODRIVE_HOME}
                    RDS_USER=${RDS_USER}
                    RDS_PASSWORD=${RDS_PASSWORD}
                    RDS_PORT=${RDS_PORT}
                    DATABASE_URL=${DATABASE_URL}
                    SHADOW_DATABASE_URL=${SHADOW_DATABASE_URL}
                    """.stripIndent()

                    writeFile file: './apps/database/.env', text: envFileContent
                }
                sh 'pnpm run db:push'
            }
        }

        stage('Type check') {
            steps {
                echo 'Running typecheck...'
                sh 'pnpm run typecheck'
            }
        }

        // stage('Test') {
        //     steps {
        //         echo 'Running vitest...'
        //         sh 'pnpm run test -- run'
        //     }
        // }

        stage('Build') {
            when {
                branch MAIN
            }
            steps {
                echo 'Building...'
                sh 'pnpm run build'
            }
        }

        stage('Build Docker image') {
            when {
                branch MAIN
            }
            steps {
                echo 'Building Docker image...'
                sh 'pnpm run docker:build'
            }
        }

        stage('Deploy') {
            when {
                branch MAIN
            }
            environment {
                SSH_CREDS = credentials('EC2_SSH_CREDENTIAL_ID')
                DEPLOY_PATH = '/home/ec2-user/cirrodrive/deploy'
            }
            steps {
                script {
                    echo 'Deploying...'

                    sshagent(credentials: ['EC2_SSH_CREDENTIAL_ID']) {
                        // 원격 디렉토리 생성
                        sh 'ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" "mkdir -p ${DEPLOY_PATH}"'

                        // compose 파일 전송
                        sh 'scp -o StrictHostKeyChecking=no ./compose.yaml "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}:${DEPLOY_PATH}/"'

                        // 도커 컴포즈 실행
                        sh """
                            ssh -o StrictHostKeyChecking=no "${SSH_CREDS_USR}@${EC2_PRIVATE_IP}" <<EOF
                            export CIRRODRIVE_HOME="${CIRRODRIVE_HOME}"
                            export RDS_USER="${RDS_USER}"
                            export RDS_PASSWORD="${RDS_PASSWORD}"
                            export RDS_HOST="${RDS_HOST}"
                            export RDS_PORT="${RDS_PORT}"
                            export DATABASE_URL="${DATABASE_URL}"
                            export SHADOW_DATABASE_URL="${SHADOW_DATABASE_URL}"
                            export VITE_CLIENT_PORT="${VITE_CLIENT_PORT}"
                            export VITE_SERVER_PORT="${VITE_SERVER_PORT}"
                            docker-compose -f ${DEPLOY_PATH}/compose.yaml up -d --remove-orphans --renew-anon-volumes ${FRONTEND_CONTAINER_NAME} ${BACKEND_CONTAINER_NAME}
                            """
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            cleanWs(deleteDirs: true)
        }
    }
}
