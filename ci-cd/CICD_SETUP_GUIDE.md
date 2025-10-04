# CI/CD Pipeline Setup Guide

## 🚀 Complete CI/CD Pipeline with Jenkins

This guide sets up a complete CI/CD pipeline with:
- ✅ **Code Quality**: SonarQube
- ✅ **Security Scanning**: Trivy, OWASP Dependency Check
- ✅ **Testing**: Jest unit tests
- ✅ **Build**: Docker images
- ✅ **Deploy**: Kubernetes via ArgoCD
- ✅ **Monitoring**: Prometheus & Grafana

## 📋 Prerequisites

### Required Tools
- Jenkins (2.400+)
- Docker
- Kubernetes cluster (kind/minikube)
- SonarQube
- Trivy
- ArgoCD
- Git

## 🔧 Step 1: Install Jenkins

### On Windows (using Chocolatey):
```powershell
choco install jenkins
```

### On Linux:
```bash
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins
```

### Start Jenkins:
```powershell
# Windows
net start jenkins

# Linux
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Access Jenkins at: **http://localhost:8080**

## 🔧 Step 2: Install Required Jenkins Plugins

Go to **Manage Jenkins** → **Manage Plugins** → **Available**

Install these plugins:
1. **Docker Pipeline**
2. **Kubernetes**
3. **SonarQube Scanner**
4. **OWASP Dependency-Check**
5. **HTML Publisher**
6. **JUnit**
7. **Git**
8. **Pipeline**
9. **Blue Ocean** (optional, for better UI)

## 🔧 Step 3: Install SonarQube

### Using Docker:
```powershell
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

### Access SonarQube:
- URL: http://localhost:9000
- Default credentials: admin/admin
- Change password on first login

### Create SonarQube Token:
1. Login to SonarQube
2. Go to **My Account** → **Security**
3. Generate token: `jenkins-token`
4. Save the token

## 🔧 Step 4: Install Trivy

### On Windows:
```powershell
choco install trivy
```

### On Linux:
```bash
wget https://github.com/aquasecurity/trivy/releases/download/v0.48.0/trivy_0.48.0_Linux-64bit.tar.gz
tar zxvf trivy_0.48.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/
```

### Verify:
```powershell
trivy --version
```

## 🔧 Step 5: Install OWASP Dependency Check

### Download:
```powershell
# Download from: https://github.com/jeremylong/DependencyCheck/releases
# Extract to C:\tools\dependency-check
```

### Configure in Jenkins:
1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Find **OWASP Dependency-Check**
3. Add installation:
   - Name: `OWASP-Dependency-Check`
   - Install automatically or specify path

## 🔧 Step 6: Configure Jenkins Credentials

Go to **Manage Jenkins** → **Manage Credentials** → **Global**

Add these credentials:

### 1. Docker Hub Credentials
- Kind: Username with password
- ID: `docker-hub-credentials`
- Username: Your Docker Hub username
- Password: Your Docker Hub password/token

### 2. SonarQube Token
- Kind: Secret text
- ID: `sonarqube-token`
- Secret: Your SonarQube token

### 3. Kubeconfig
- Kind: Secret file
- ID: `kubeconfig`
- File: Your kubeconfig file (~/.kube/config)

### 4. ArgoCD Credentials
- Kind: Username with password
- ID: `argocd-credentials`
- Username: admin
- Password: Your ArgoCD password

## 🔧 Step 7: Configure Jenkins Tools

### SonarQube Scanner
1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Find **SonarQube Scanner**
3. Add SonarQube Scanner:
   - Name: `SonarQubeScanner`
   - Install automatically: Yes
   - Version: Latest

### SonarQube Server
1. Go to **Manage Jenkins** → **Configure System**
2. Find **SonarQube servers**
3. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://localhost:9000`
   - Server authentication token: Select `sonarqube-token`

## 🔧 Step 8: Create Jenkins Pipeline Job

1. Click **New Item**
2. Enter name: `dress-dock-flow-pipeline`
3. Select **Pipeline**
4. Click **OK**

### Configure Pipeline:
1. **General**:
   - Description: "CI/CD Pipeline for Dress Dock Flow"
   - GitHub project: Your repo URL

2. **Build Triggers**:
   - ☑ GitHub hook trigger for GITScm polling
   - ☑ Poll SCM: `H/5 * * * *` (every 5 minutes)

3. **Pipeline**:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your GitHub repo
   - Credentials: Add GitHub credentials
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

4. Click **Save**

## 🔧 Step 9: Configure GitHub Webhook (Optional)

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://your-jenkins-url:8080/github-webhook/`
4. Content type: `application/json`
5. Events: Just the push event
6. Active: ☑
7. Add webhook

## 🎯 Pipeline Stages Explained

### 1. **Checkout**
- Clones the repository
- Gets commit ID for tagging

### 2. **Install Dependencies**
- Installs npm packages for server and client
- Runs in parallel for speed

### 3. **Run Tests**
- Executes Jest unit tests
- Generates code coverage report
- Publishes test results

### 4. **Code Quality Analysis**
- **SonarQube**: Code quality, bugs, vulnerabilities
- **OWASP**: Dependency vulnerabilities
- Runs in parallel

### 5. **Quality Gate**
- Waits for SonarQube analysis
- Can abort pipeline if quality gate fails

### 6. **Build Docker Images**
- Builds server and client images
- Tags with build number and commit ID
- Runs in parallel

### 7. **Security Scanning**
- **Trivy**: Scans Docker images for vulnerabilities
- Generates HTML reports
- Checks for HIGH and CRITICAL issues

### 8. **Push Docker Images**
- Pushes images to Docker Hub
- Only on main branch

### 9. **Update Kubernetes Manifests**
- Updates image tags in k8s files
- Commits and pushes changes
- Triggers ArgoCD sync

### 10. **Deploy via ArgoCD**
- Syncs ArgoCD application
- Waits for deployment completion

### 11. **Verify Deployment**
- Checks pod status
- Verifies rollout

### 12. **Smoke Tests**
- Tests health endpoint
- Tests API endpoints
- Ensures app is working

## 📊 Viewing Reports

### Code Coverage
- Jenkins → Job → Latest Build → Code Coverage Report

### SonarQube Analysis
- http://localhost:9000
- View project: dress-dock-flow

### OWASP Dependency Check
- Jenkins → Job → Latest Build → Dependency-Check Report

### Trivy Security Scan
- Jenkins → Job → Latest Build → Trivy Security Scan

## 🔄 Running the Pipeline

### Manual Trigger:
1. Go to Jenkins job
2. Click **Build Now**

### Automatic Trigger:
- Push to main branch
- GitHub webhook triggers build

### Monitor Progress:
- Click on build number
- View **Console Output**
- Or use **Blue Ocean** for visual pipeline

## 🐛 Troubleshooting

### Pipeline Fails at SonarQube
```powershell
# Check SonarQube is running
docker ps | grep sonarqube

# Check SonarQube logs
docker logs sonarqube
```

### Pipeline Fails at Docker Build
```powershell
# Check Docker is running
docker ps

# Check Docker credentials
docker login
```

### Pipeline Fails at Kubernetes Deploy
```powershell
# Check kubeconfig
kubectl get pods

# Check ArgoCD
kubectl get pods -n argocd
```

### Trivy Scan Fails
```powershell
# Update Trivy database
trivy image --download-db-only

# Check Trivy version
trivy --version
```

## 📈 Best Practices

1. **Always run tests** before deploying
2. **Review security scan results** regularly
3. **Set quality gates** in SonarQube
4. **Use semantic versioning** for tags
5. **Keep dependencies updated**
6. **Monitor pipeline metrics**
7. **Set up notifications** (Slack, Email)
8. **Backup Jenkins configuration**

## 🎯 Next Steps

1. ✅ Set up Jenkins
2. ✅ Install all plugins
3. ✅ Configure SonarQube
4. ✅ Install Trivy
5. ✅ Add credentials
6. ✅ Create pipeline job
7. ✅ Run first build
8. ✅ Review reports
9. ✅ Set up notifications
10. ✅ Configure quality gates

## 📚 Additional Resources

- **Jenkins**: https://www.jenkins.io/doc/
- **SonarQube**: https://docs.sonarqube.org/
- **Trivy**: https://aquasecurity.github.io/trivy/
- **OWASP**: https://owasp.org/www-project-dependency-check/
- **ArgoCD**: https://argo-cd.readthedocs.io/

---

**Your CI/CD pipeline is ready! Push code to trigger the pipeline.** 🚀
