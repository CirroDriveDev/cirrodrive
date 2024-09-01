pipeline {
  agent any
  environment {
        // 공통 변수 설정 (EC2 SSH 정보 등)
        EC2_HOST_PROD = 'ec2-user@prod-server-ip'
        EC2_HOST_DEV = 'ec2-user@dev-server-ip'
        SSH_KEY = credentials('ec2-ssh-key')
    }
  stages {
    stage('Checkout') {
            steps {
                // 두 프로젝트를 각각 클론
                git branch: 'main', url: 'https://github.com/your-org/react-spa.git'
                git branch: 'main', url: 'https://github.com/your-org/api-server.git'
            }
        }
        
    stage('Build') {
      steps {
        echo 'Building..'
      }
    }
    stage('Test') {
      steps {
        echo 'Testing..'
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deploying....'
      }
    }
  }
}