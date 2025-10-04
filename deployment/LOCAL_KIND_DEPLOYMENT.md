# Local Kubernetes Deployment with Kind

## 🎯 Complete Guide to Deploy on Local Kind Cluster

This guide walks you through deploying the Dress Dock Flow application on a local Kubernetes cluster using kind (Kubernetes in Docker).

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **kubectl** - Kubernetes CLI
- **kind** - Kubernetes in Docker
- **Helm** - Package manager for Kubernetes
- **Git** - Version control

### Installation

#### Windows (using Chocolatey):
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install docker-desktop
choco install kubernetes-cli
choco install kind
choco install kubernetes-helm
choco install git
```

#### Linux:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Mac (using Homebrew):
```bash
brew install docker
brew install kubectl
brew install kind
brew install helm
brew install git
```

## 🚀 Step-by-Step Deployment

### Step 1: Clone the Repository

```powershell
git clone https://github.com/bashairfan0911/dress-dock-flow.git
cd dress-dock-flow
```

### Step 2: Create Kind Cluster

```powershell
# Create cluster with custom configuration
kind create cluster --config kind-config.yaml

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

**Expected Output:**
```
NAME                              STATUS   ROLES           AGE   VERSION
dress-dock-cluster-control-plane  Ready    control-plane   1m    v1.34.0
```

### Step 3: Build Docker Images

```powershell
# Build server image
docker build -t dress-dock-server:latest -f Dockerfile.server .

# Build client image
docker build -t dress-dock-client:latest -f Dockerfile.client .

# Verify images
docker images | Select-String "dress-dock"
```

### Step 4: Load Images into Kind

```powershell
# Load server image
kind load docker-image dress-dock-server:latest --name dress-dock-cluster

# Load client image
kind load docker-image dress-dock-client:latest --name dress-dock-cluster

# Verify images in cluster
docker exec -it dress-dock-cluster-control-plane crictl images | Select-String "dress-dock"
```

### Step 5: Deploy MongoDB

```powershell
# Apply MongoDB deployment
kubectl apply -f k8s/mongodb.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=Ready pod -l app=mongodb --timeout=300s

# Verify MongoDB is running
kubectl get pods -l app=mongodb
```

### Step 6: Create Secrets

```powershell
# Apply secrets
kubectl apply -f k8s/secrets.yaml

# Verify secrets
kubectl get secrets
```

### Step 7: Deploy Application

```powershell
# Deploy server
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/services.yaml

# Deploy client
kubectl apply -f k8s/client-deployment.yaml

# Wait for deployments
kubectl wait --for=condition=Available deployment/dress-dock-server --timeout=300s
kubectl wait --for=condition=Available deployment/dress-dock-client --timeout=300s

# Verify all pods are running
kubectl get pods
```

**Expected Output:**
```
NAME                                 READY   STATUS    RESTARTS   AGE
dress-dock-client-xxx-xxx            1/1     Running   0          2m
dress-dock-client-xxx-xxx            1/1     Running   0          2m
dress-dock-server-xxx-xxx            1/1     Running   0          2m
dress-dock-server-xxx-xxx            1/1     Running   0          2m
mongodb-xxx-xxx                      1/1     Running   0          3m
```

### Step 8: Install NGINX Ingress Controller

```powershell
# Install NGINX Ingress for kind
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

### Step 9: Apply Ingress

```powershell
# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml

# Verify ingress
kubectl get ingress
```

### Step 10: Seed Database

```powershell
# Get server pod name
$podName = (kubectl get pods -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')

# Run seed script
kubectl exec $podName -- node seed.js

# Verify products
curl http://localhost/api/products
```

### Step 11: Access Application

Open your browser to: **http://localhost/**

- **Frontend**: http://localhost/
- **API**: http://localhost/api/products
- **Health Check**: http://localhost/api/health

## 📊 Verify Deployment

### Check All Resources

```powershell
# Get all resources
kubectl get all

# Check pod logs
kubectl logs -l app=dress-dock-server --tail=50
kubectl logs -l app=dress-dock-client --tail=50

# Check services
kubectl get svc

# Check ingress
kubectl get ingress
```

### Test Endpoints

```powershell
# Test health
curl http://localhost/api/health

# Test products
curl http://localhost/api/products

# Test frontend
curl http://localhost/
```

## 🔧 Optional: Install ArgoCD

```powershell
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

# Port-forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Apply ArgoCD application
kubectl apply -f k8s/argocd/application.yaml
```

Access ArgoCD: **https://localhost:8080**

## 📊 Optional: Install Monitoring

```powershell
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring -f monitoring/prometheus-values.yaml

# Wait for monitoring stack
kubectl wait --for=condition=Ready pods --all -n monitoring --timeout=600s

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

Access Grafana: **http://localhost:3000** (admin/admin123)

## 🛠️ Troubleshooting

### Pods Not Starting

```powershell
# Check pod status
kubectl get pods

# Describe pod
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Images Not Found

```powershell
# Rebuild images
docker build -t dress-dock-server:latest -f Dockerfile.server .
docker build -t dress-dock-client:latest -f Dockerfile.client .

# Reload into kind
kind load docker-image dress-dock-server:latest --name dress-dock-cluster
kind load docker-image dress-dock-client:latest --name dress-dock-cluster

# Restart deployments
kubectl rollout restart deployment dress-dock-server
kubectl rollout restart deployment dress-dock-client
```

### Cannot Access Application

```powershell
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress
kubectl get ingress

# Check services
kubectl get svc

# Port-forward directly to service
kubectl port-forward svc/dress-dock-client 8080:80
```

Then access: http://localhost:8080

### MongoDB Connection Issues

```powershell
# Check MongoDB pod
kubectl get pods -l app=mongodb

# Check MongoDB logs
kubectl logs -l app=mongodb

# Check MongoDB service
kubectl get svc mongodb

# Test connection from server pod
kubectl exec -it <server-pod-name> -- sh
# Inside pod:
nc -zv mongodb 27017
```

## 🔄 Update Deployment

### Update Images

```powershell
# Rebuild images
docker build -t dress-dock-server:latest -f Dockerfile.server .
docker build -t dress-dock-client:latest -f Dockerfile.client .

# Load into kind
kind load docker-image dress-dock-server:latest --name dress-dock-cluster
kind load docker-image dress-dock-client:latest --name dress-dock-cluster

# Restart deployments
kubectl rollout restart deployment dress-dock-server
kubectl rollout restart deployment dress-dock-client

# Watch rollout
kubectl rollout status deployment dress-dock-server
kubectl rollout status deployment dress-dock-client
```

### Update Configuration

```powershell
# Edit deployment
kubectl edit deployment dress-dock-server

# Or apply changes
kubectl apply -f k8s/server-deployment.yaml

# Verify changes
kubectl get deployment dress-dock-server -o yaml
```

## 🧹 Cleanup

### Delete Application

```powershell
# Delete all k8s resources
kubectl delete -f k8s/

# Or delete specific resources
kubectl delete deployment dress-dock-server dress-dock-client mongodb
kubectl delete service dress-dock-server dress-dock-client mongodb
kubectl delete ingress dress-dock-ingress
kubectl delete secret mongodb-secret
```

### Delete Monitoring

```powershell
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring
```

### Delete ArgoCD

```powershell
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete namespace argocd
```

### Delete Kind Cluster

```powershell
# Delete cluster
kind delete cluster --name dress-dock-cluster

# Verify deletion
kind get clusters
```

## 📝 Quick Reference Commands

```powershell
# Cluster Management
kind create cluster --config kind-config.yaml
kind delete cluster --name dress-dock-cluster
kind get clusters

# Image Management
docker build -t <image>:<tag> -f <dockerfile> .
kind load docker-image <image>:<tag> --name <cluster>

# Deployment
kubectl apply -f <file>
kubectl delete -f <file>
kubectl get all
kubectl get pods
kubectl get svc
kubectl get ingress

# Logs & Debug
kubectl logs <pod-name>
kubectl logs -l app=<label>
kubectl describe pod <pod-name>
kubectl exec -it <pod-name> -- sh

# Restart
kubectl rollout restart deployment <name>
kubectl rollout status deployment <name>

# Port Forward
kubectl port-forward svc/<service> <local-port>:<service-port>
kubectl port-forward pod/<pod> <local-port>:<pod-port>
```

## 🎯 Next Steps

1. ✅ Deploy application
2. ✅ Verify all pods running
3. ✅ Access application at http://localhost/
4. ✅ Install ArgoCD (optional)
5. ✅ Install monitoring (optional)
6. ✅ Set up CI/CD pipeline

## 📚 Additional Resources

- **Kind Documentation**: https://kind.sigs.k8s.io/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

---

**Your application is now running on local Kubernetes!** 🚀
