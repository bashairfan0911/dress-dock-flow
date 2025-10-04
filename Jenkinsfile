pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        SONARQUBE_SERVER = 'SonarQube'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        KUBECONFIG = credentials('kubeconfig')
        ARGOCD_SERVER = 'localhost:8080'
        ARGOCD_CREDENTIALS = credentials('argocd-credentials')
        APP_NAME = 'dress-dock-flow'
        GIT_REPO = 'https://github.com/bashairfan0911/dress-dock-flow.git'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
                sh 'git rev-parse --short HEAD > .git/commit-id'
                script {
                    env.GIT_COMMIT_SHORT = readFile('.git/commit-id').trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            echo '📦 Installing server dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Client Dependencies') {
                    steps {
                        echo '📦 Installing client dependencies...'
                        sh 'npm ci'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('server') {
                    echo '🧪 Running unit tests...'
                    sh 'npm test || true'
                }
            }
            post {
                always {
                    junit '**/test-results/*.xml' allowEmptyResults: true
                    publishHTML([
                        reportDir: 'server/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Code Coverage Report'
                    ])
                }
            }
        }
        
        stage('Code Quality Analysis') {
            parallel {
                stage('SonarQube Scan') {
                    steps {
                        echo '🔍 Running SonarQube analysis...'
                        script {
                            def scannerHome = tool 'SonarQubeScanner'
                            withSonarQubeEnv('SonarQube') {
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=${APP_NAME} \
                                    -Dsonar.projectName=${APP_NAME} \
                                    -Dsonar.projectVersion=${BUILD_TAG} \
                                    -Dsonar.sources=. \
                                    -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/** \
                                    -Dsonar.javascript.lcov.reportPaths=server/coverage/lcov.info \
                                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                                """
                            }
                        }
                    }
                }
                
                stage('OWASP Dependency Check') {
                    steps {
                        echo '🛡️ Running OWASP Dependency Check...'
                        dependencyCheck additionalArguments: '''
                            --scan .
                            --format HTML
                            --format XML
                            --project dress-dock-flow
                            --exclude "**/node_modules/**"
                        ''', odcInstallation: 'OWASP-Dependency-Check'
                        
                        dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Checking SonarQube Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Server Image') {
                    steps {
                        echo '🐳 Building server Docker image...'
                        script {
                            docker.build("${DOCKER_REGISTRY}/dress-dock-server:${BUILD_TAG}", "-f Dockerfile.server .")
                            docker.build("${DOCKER_REGISTRY}/dress-dock-server:latest", "-f Dockerfile.server .")
                        }
                    }
                }
                
                stage('Build Client Image') {
                    steps {
                        echo '🐳 Building client Docker image...'
                        script {
                            docker.build("${DOCKER_REGISTRY}/dress-dock-client:${BUILD_TAG}", "-f Dockerfile.client .")
                            docker.build("${DOCKER_REGISTRY}/dress-dock-client:latest", "-f Dockerfile.client .")
                        }
                    }
                }
            }
        }
        
        stage('Security Scanning') {
            parallel {
                stage('Trivy Scan - Server') {
                    steps {
                        echo '🔒 Scanning server image with Trivy...'
                        sh """
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --format json \
                                --output trivy-server-report.json \
                                ${DOCKER_REGISTRY}/dress-dock-server:${BUILD_TAG}
                            
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --format template \
                                --template '@/usr/local/share/trivy/templates/html.tpl' \
                                --output trivy-server-report.html \
                                ${DOCKER_REGISTRY}/dress-dock-server:${BUILD_TAG}
                        """
                    }
                }
                
                stage('Trivy Scan - Client') {
                    steps {
                        echo '🔒 Scanning client image with Trivy...'
                        sh """
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --format json \
                                --output trivy-client-report.json \
                                ${DOCKER_REGISTRY}/dress-dock-client:${BUILD_TAG}
                            
                            trivy image \
                                --severity HIGH,CRITICAL \
                                --format template \
                                --template '@/usr/local/share/trivy/templates/html.tpl' \
                                --output trivy-client-report.html \
                                ${DOCKER_REGISTRY}/dress-dock-client:${BUILD_TAG}
                        """
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        reportDir: '.',
                        reportFiles: 'trivy-server-report.html,trivy-client-report.html',
                        reportName: 'Trivy Security Scan'
                    ])
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing Docker images to registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_REGISTRY}/dress-dock-server:${BUILD_TAG}").push()
                        docker.image("${DOCKER_REGISTRY}/dress-dock-server:latest").push()
                        docker.image("${DOCKER_REGISTRY}/dress-dock-client:${BUILD_TAG}").push()
                        docker.image("${DOCKER_REGISTRY}/dress-dock-client:latest").push()
                    }
                }
            }
        }
        
        stage('Update Kubernetes Manifests') {
            when {
                branch 'main'
            }
            steps {
                echo '📝 Updating Kubernetes manifests...'
                sh """
                    sed -i 's|image: dress-dock-server:.*|image: ${DOCKER_REGISTRY}/dress-dock-server:${BUILD_TAG}|g' k8s/server-deployment.yaml
                    sed -i 's|image: dress-dock-client:.*|image: ${DOCKER_REGISTRY}/dress-dock-client:${BUILD_TAG}|g' k8s/client-deployment.yaml
                    
                    git config user.email "jenkins@ci.com"
                    git config user.name "Jenkins CI"
                    git add k8s/server-deployment.yaml k8s/client-deployment.yaml
                    git commit -m "Update image tags to ${BUILD_TAG}" || true
                    git push origin main || true
                """
            }
        }
        
        stage('Deploy to Kubernetes via ArgoCD') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Triggering ArgoCD sync...'
                sh """
                    argocd login ${ARGOCD_SERVER} \
                        --username admin \
                        --password ${ARGOCD_CREDENTIALS_PSW} \
                        --insecure
                    
                    argocd app sync ${APP_NAME} --force
                    argocd app wait ${APP_NAME} --timeout 300
                """
            }
        }
        
        stage('Verify Deployment') {
            when {
                branch 'main'
            }
            steps {
                echo '✅ Verifying deployment...'
                sh """
                    kubectl get pods -n default
                    kubectl rollout status deployment/dress-dock-server -n default
                    kubectl rollout status deployment/dress-dock-client -n default
                """
            }
        }
        
        stage('Run Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                echo '🔥 Running smoke tests...'
                sh '''
                    # Test health endpoint
                    curl -f http://localhost/api/health || exit 1
                    
                    # Test products endpoint
                    curl -f http://localhost/api/products || exit 1
                    
                    echo "✅ Smoke tests passed!"
                '''
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
            // Send notification (Slack, Email, etc.)
        }
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notification
        }
    }
}
