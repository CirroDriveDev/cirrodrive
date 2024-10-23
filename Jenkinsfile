pipeline {
    agent any

    tools {
        nodejs 'NodeJS_LTS'
    }

    environment {
        TURBO_TELEMETRY_DISABLED = 1
        MAIN = 'main'
        DEVELOP = 'develop'
        DATABASE_URL = 'mysql://apiuser:apipassword@database-dev:3307/apidatabase'
    }

    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
                sh 'npm run ci:runDatabase --workspace=backend'
                sh 'npm run prisma:generate --workspace=backend'
            }
        }

        stage('Type check') {
            steps {
                echo 'Running tsc...'
                sh 'npm run tsc'
            }
        }

        stage('Test') {
            steps {
                echo 'Running vitest...'
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                echo 'Building the app...'
                sh 'npm run compose:prod:build'
                sh 'npm run compose:dev:build'
            }
        }

        stage('Deploy') {
            environment {
                DATABASE_URL = credentials('DATABASE_URL_CREDENTIAL_ID')
                MARIADB_ROOT_PASSWORD = credentials('MARIADB_ROOT_PASSWORD_CREDENTIAL_ID')
                MARIADB_USER = credentials('MARIADB_USER_CREDENTIAL_ID')
                MARIADB_PASSWORD = credentials('MARIADB_PASSWORD_CREDENTIAL_ID')
                MARIADB_DATABASE = credentials('MARIADB_DATABASE_CREDENTIAL_ID')
            }
            when {
                anyOf {
                    branch MAIN
                    branch DEVELOP
                }
            }
            steps {
                script {
                    if (BRANCH_NAME == MAIN) {
                        echo 'Deploying to production...'
                        sh 'npm run compose:prod:up'
                    } else if (BRANCH_NAME == DEVELOP) {
                        echo 'Deploying to development...'
                        sh 'npm run compose:dev:up'
                    }
                }
            }
        }
    }
}
