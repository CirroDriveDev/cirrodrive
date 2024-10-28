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
        DATABASE_URL = 'mysql://apiuser:apipassword@database-dev:3307/apidatabase'
        PROD_DATABASE_URL = credentials('DATABASE_URL_CREDENTIAL_ID')
        PROD_MARIADB_ROOT_PASSWORD = credentials('MARIADB_ROOT_PASSWORD_CREDENTIAL_ID')
        PROD_MARIADB_USER = credentials('MARIADB_USER_CREDENTIAL_ID')
        PROD_MARIADB_PASSWORD = credentials('MARIADB_PASSWORD_CREDENTIAL_ID')
        PROD_MARIADB_DATABASE = credentials('MARIADB_DATABASE_CREDENTIAL_ID')
    }

    stages {
        stage('Install dependency') {
            steps {
                script {
                    env.PATH = "${env.PNPM_HOME}:${env.PATH}"
                }
                echo 'Installing dependencies...'
                sh 'corepack enable pnpm'
                sh 'pnpm install --frozen-lockfile'
                sh 'pnpm -F @cirrodrive/backend run ci:runDatabase'
                sh 'pnpm -F @cirrodrive/backend run prisma:generate'
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
                sh 'pnpm run test'
            }
        }

        stage('Build') {
            steps {
                echo 'Building the app...'
                sh 'pnpm run compose:prod:build'
                sh 'pnpm run compose:dev:build'
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch MAIN
                    branch DEVELOP
                }
            }
            steps {
                script {
                    if (BRANCH_NAME == MAIN) {
                        env.DATABASE_URL = PROD_DATABASE_URL
                        env.MARIADB_ROOT_PASSWORD = PROD_MARIADB_ROOT_PASSWORD
                        env.MARIADB_USER = PROD_MARIADB_USER
                        env.MARIADB_PASSWORD = PROD_MARIADB_PASSWORD
                        env.MARIADB_DATABASE = PROD_MARIADB_DATABASE
                        echo 'Deploying to production...'
                        sh 'pnpm run compose:prod:up'
                    } else if (BRANCH_NAME == DEVELOP) {
                        echo 'Deploying to development...'
                        sh 'pnpm run compose:dev:up'
                    }
                }
            }
        }
    }
}
