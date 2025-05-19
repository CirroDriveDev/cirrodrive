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
        MAIN = 'main'

        CIRRODRIVE_HOME = '~/cirrodrive'

        // 데이터베이스
        RDS_USER = credentials('RDS_USER_CREDENTIAL_ID')
        RDS_PASSWORD = credentials('RDS_PASSWORD_CREDENTIAL_ID')
        RDS_HOST = credentials('RDS_HOST_CREDENTIAL_ID')
        RDS_PORT = credentials('RDS_PORT_CREDENTIAL_ID')
        RDS_DATABASE = credentials('RDS_DATABASE_CREDENTIAL_ID')
        RDS_SHADOW_DATABASE = credentials('RDS_SHADOW_DATABASE_CREDENTIAL_ID')

        // 포트
        CLIENT_PORT = '80'
        SERVER_PORT = '8000'

        // API 서버
        EC2_PUBLIC_URL = "${EC2_PUBLIC_URL}"

        // 컨테이너 이름
        FRONTEND_CONTAINER_NAME = 'frontend'
        BACKEND_CONTAINER_NAME = 'backend'

        // AWS
        AWS_REGION = credentials('AWS_REGION_CREDENTIAL_ID')
        AWS_S3_BUCKET = credentials('AWS_S3_BUCKET_CREDENTIAL_ID')

        // SES 이메일
        SES_SOURCE_EMAIL = credentials('SES_SOURCE_EMAIL_CREDENTIAL_ID')

        // JWT 비밀키
        JWT_SECRET = credentials('JWT_SECRET_CREDENTIAL_ID')

        // 관리자 계정
        ADMIN_USERNAME = credentials('ADMIN_USERNAME_CREDENTIAL_ID')
        ADMIN_PASSWORD = credentials('ADMIN_PASSWORD_CREDENTIAL_ID')

        // Toss 결제
        TOSS_SECRET_KEY = credentials('TOSS_SECRET_KEY_ID')
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
                sh '''
                npm install -g corepack
                corepack enable pnpm
                '''
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
                sh 'pnpm build -F @cirrodrive/database'
            }
        }

        stage('DB push & seed') {
            when {
                branch MAIN
            }
            steps {
                echo 'Push prisma schema to database...'
                script {
                    // .env 파일 생성
                    def envFileContent = """
                    CIRRODRIVE_HOME=${CIRRODRIVE_HOME}
                    RDS_USER=${RDS_USER}
                    RDS_PASSWORD=${RDS_PASSWORD}
                    RDS_HOST=${RDS_HOST}
                    RDS_PORT=${RDS_PORT}
                    RDS_DATABASE=${RDS_DATABASE}
                    RDS_SHADOW_DATABASE=${RDS_SHADOW_DATABASE}
                    DATABASE_URL=${DATABASE_URL}
                    SHADOW_DATABASE_URL=${SHADOW_DATABASE_URL}
                    ADMIN_USERNAME=${ADMIN_USERNAME}
                    ADMIN_PASSWORD=${ADMIN_PASSWORD}
                    """.stripIndent()

                    writeFile file: './apps/database/.env', text: envFileContent
                }
                sh 'pnpm run db:push'
                sh 'pnpm run db:seed'
            }
        }

        stage('Generate .env.production') {
            when {
                branch MAIN
            }
            steps {
                echo 'Generating .env.production for backend and frontend...'
                script {
                    def envProdContentBackend = """
                    CIRRODRIVE_HOME=${CIRRODRIVE_HOME}
                    RDS_USER=${RDS_USER}
                    RDS_PASSWORD=${RDS_PASSWORD}
                    RDS_HOST=${RDS_HOST}
                    RDS_PORT=${RDS_PORT}
                    RDS_DATABASE=${RDS_DATABASE}
                    DATABASE_URL=${DATABASE_URL}
                    CLIENT_PORT=${CLIENT_PORT}
                    SERVER_PORT=${SERVER_PORT}
                    SES_SOURCE_EMAIL=${SES_SOURCE_EMAIL}
                    TOSS_SECRET_KEY=${TOSS_SECRET_KEY}
                    JWT_SECRET=${JWT_SECRET}
                    AWS_REGION=${AWS_REGION}
                    AWS_S3_BUCKET=${AWS_S3_BUCKET}
                    EC2_PUBLIC_URL=${EC2_PUBLIC_URL}
                    AWS_SES_SOURCE_EMAIL=${SES_SOURCE_EMAIL}
                    """.stripIndent()
                    writeFile file: './apps/backend/.env.production', text: envProdContentBackend

                    def envProdContentFrontend = """
                    VITE_EC2_PUBLIC_URL=${EC2_PUBLIC_URL}
                    VITE_SERVER_PORT=${SERVER_PORT}
                    """.stripIndent()
                    writeFile file: './apps/frontend/.env.production', text: envProdContentFrontend
                }
            }
        }

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
                            export CLIENT_PORT="${CLIENT_PORT}"
                            export SERVER_PORT="${SERVER_PORT}"
                            export SES_SOURCE_EMAIL="${SES_SOURCE_EMAIL}"
                            export TOSS_SECRET_KEY_ID="${TOSS_SECRET_KEY}"
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
