pipeline {
    agent any

    tools {
        nodejs 'NodeJS_LTS'
    }

    environment {
        TURBO_TELEMETRY_DISABLED = 1
        MAIN = 'main'
        DEVELOP = 'develop'
    }

    stages {
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
