# Cleanup & Destroy Guide

## 🧹 Complete Cleanup Instructions

This guide provides commands to clean up and destroy all resources created for the Dress Dock Flow application.

## 📋 Table of Contents

- [Quick Cleanup](#quick-cleanup)
- [Local Kind Cleanup](#local-kind-cleanup)
- [AWS EKS Cleanup](#aws-eks-cleanup)
- [CI/CD Tools Cleanup](#cicd-tools-cleanup)
- [Monitoring Cleanup](#monitoring-cleanup)
- [ArgoCD Cleanup](#argocd-cleanup)
- [Complete System Cleanup](#complete-system-cleanup)

## 🚀 Quick Cleanup

### One-Command Cleanup (Local Kind)

```powershell
# Delete everything
kubectl delete -f k8s/
kind delete cluster --name dress-dock-cluster
docker rmi dress-dock-server:latest dress-dock-client:latest
```

## 🏠 Local Kind Cleanup

### Step 1: Delete Kubernetes Resources

```powershell
# Delete all application resources
kubectl delete -f k8s/

# Or delete specific resources
kubectl delete deployment dress-dock-server dress-dock-client mongodb
kubectl delete service dress-dock-server dress-dock-client mongodb
kubectl delete ingress dress-dock-ingress
kubectl delete secret mongodb-secret
```

**Expected Output:**
```
deployment.apps "dress-dock-server" deleted
deployment.apps "dress-dock-client" deleted
deployment.apps "mongodb" deleted
service "dress-dock-server" deleted
service "dress-dock-client" deleted
service "mongodb" deleted
ingress.networking.k8s.io "dress-dock-ingress" deleted
secret "mongodb-secret" deleted
```

### Step 2: Delete Ingress Controller

```powershell
# Delete NGINX Ingress Controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Or delete namespace
kubectl delete namespace ingress-nginx
```

### Step 3: Delete Kind Cluster

```powershell
# List clusters
kind get clusters

# Delete specific cluster
kind delete cluster --name dress-dock-cluster

# Verify deletion
kind get clusters
```

**Expected Output:**
```
Deleting cluster "dress-dock-cluster" ...
Deleted nodes: ["dress-dock-cluster-control-plane"]
```

### Step 4: Clean Docker Images

```powershell
# List images
docker images | Select-String "dress-dock"

# Remove images
docker rmi dress-dock-server:latest
docker rmi dress-dock-client:latest

# Remove all unused images (optional)
docker image prune -a
```

### Step 5: Clean Docker Volumes (Optional)

```powershell
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm <volume-name>
```

## ☁️ AWS EKS Cleanup

### Step 1: Delete Application Resources

```powershell
# Delete Kubernetes resources
kubectl delete -f k8s/

# Wait for resources to be deleted
kubectl get all
```

### Step 2: Delete Load Balancer Controller

```powershell
# Uninstall AWS Load Balancer Controller
helm uninstall aws-load-balancer-controller -n kube-system

# Delete service account
eksctl delete iamserviceaccount `
  --cluster=dress-dock-cluster `
  --namespace=kube-system `
  --name=aws-load-balancer-controller
```

### Step 3: Delete EKS Cluster

```powershell
# Delete cluster (this will delete all resources)
eksctl delete cluster --name dress-dock-cluster --region us-east-1

# This will take 10-15 minutes
```

**Expected Output:**
```
2025-10-04 10:00:00 [ℹ]  deleting EKS cluster "dress-dock-cluster"
2025-10-04 10:00:01 [ℹ]  will drain 0 unmanaged nodegroup(s) in cluster "dress-dock-cluster"
2025-10-04 10:00:02 [ℹ]  starting parallel draining, max in-flight of 1
2025-10-04 10:00:03 [ℹ]  deleted 0 Fargate profile(s)
2025-10-04 10:00:04 [✔]  kubeconfig has been updated
2025-10-04 10:00:05 [ℹ]  cleaning up AWS load balancers created by Kubernetes objects of Kind Service or Ingress
2025-10-04 10:15:00 [✔]  all cluster resources were deleted
```

### Step 4: Delete ECR Repositories

```powershell
# List repositories
aws ecr describe-repositories --region us-east-1

# Delete images first
aws ecr batch-delete-image `
  --repository-name dress-dock-server `
  --image-ids imageTag=latest `
  --region us-east-1

aws ecr batch-delete-image `
  --repository-name dress-dock-client `
  --image-ids imageTag=latest `
  --region us-east-1

# Delete repositories
aws ecr delete-repository `
  --repository-name dress-dock-server `
  --force `
  --region us-east-1

aws ecr delete-repository `
  --repository-name dress-dock-client `
  --force `
  --region us-east-1
```

### Step 5: Delete IAM Policies (Optional)

```powershell
# List policies
aws iam list-policies --scope Local

# Delete policy
aws iam delete-policy `
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy
```

### Step 6: Verify Cleanup

```powershell
# Check EKS clusters
aws eks list-clusters --region us-east-1

# Check ECR repositories
aws ecr describe-repositories --region us-east-1

# Check EC2 instances
aws ec2 describe-instances --region us-east-1 --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'

# Check Load Balancers
aws elbv2 describe-load-balancers --region us-east-1
```

## 🔧 CI/CD Tools Cleanup

### Stop and Remove CI/CD Containers

```powershell
# Navigate to ci-cd directory
cd ci-cd

# Stop containers
docker-compose -f docker-compose-cicd.yml down

# Remove volumes (this will delete all data)
docker-compose -f docker-compose-cicd.yml down -v

# Verify removal
docker ps -a | Select-String "sonarqube|jenkins"
```

### Clean CI/CD Data

```powershell
# Remove Docker volumes
docker volume rm ci-cd_sonarqube_data
docker volume rm ci-cd_sonarqube_extensions
docker volume rm ci-cd_sonarqube_logs
docker volume rm ci-cd_jenkins_home
docker volume rm ci-cd_postgresql_data

# Or remove all unused volumes
docker volume prune
```

## 📊 Monitoring Cleanup

### Step 1: Uninstall Prometheus Stack

```powershell
# Uninstall Helm release
helm uninstall prometheus -n monitoring

# Wait for resources to be deleted
kubectl get pods -n monitoring
```

### Step 2: Delete Monitoring Namespace

```powershell
# Delete namespace (this will delete all resources)
kubectl delete namespace monitoring

# Verify deletion
kubectl get namespaces
```

### Step 3: Clean Persistent Volumes

```powershell
# List persistent volumes
kubectl get pv

# Delete persistent volumes
kubectl delete pv <pv-name>

# Or delete all
kubectl delete pv --all
```

## 🔄 ArgoCD Cleanup

### Step 1: Delete ArgoCD Application

```powershell
# Delete application
kubectl delete -f k8s/argocd/application.yaml

# Or delete directly
kubectl delete application dress-dock-flow -n argocd
```

### Step 2: Uninstall ArgoCD

```powershell
# Delete ArgoCD
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Delete namespace
kubectl delete namespace argocd

# Verify deletion
kubectl get namespaces
```

## 🗑️ Complete System Cleanup

### Automated Cleanup Script

Save this as `cleanup-all.ps1`:

```powershell
# Complete Cleanup Script
Write-Host "🧹 Starting Complete Cleanup..." -ForegroundColor Cyan

# 1. Delete Kubernetes Resources
Write-Host "`n1️⃣ Deleting Kubernetes Resources..." -ForegroundColor Yellow
kubectl delete -f k8s/ 2>$null
Write-Host "✅ Kubernetes resources deleted" -ForegroundColor Green

# 2. Delete Monitoring
Write-Host "`n2️⃣ Deleting Monitoring Stack..." -ForegroundColor Yellow
helm uninstall prometheus -n monitoring 2>$null
kubectl delete namespace monitoring 2>$null
Write-Host "✅ Monitoring deleted" -ForegroundColor Green

# 3. Delete ArgoCD
Write-Host "`n3️⃣ Deleting ArgoCD..." -ForegroundColor Yellow
kubectl delete namespace argocd 2>$null
Write-Host "✅ ArgoCD deleted" -ForegroundColor Green

# 4. Delete Ingress Controller
Write-Host "`n4️⃣ Deleting Ingress Controller..." -ForegroundColor Yellow
kubectl delete namespace ingress-nginx 2>$null
Write-Host "✅ Ingress controller deleted" -ForegroundColor Green

# 5. Delete Kind Cluster
Write-Host "`n5️⃣ Deleting Kind Cluster..." -ForegroundColor Yellow
kind delete cluster --name dress-dock-cluster 2>$null
Write-Host "✅ Kind cluster deleted" -ForegroundColor Green

# 6. Clean Docker Images
Write-Host "`n6️⃣ Cleaning Docker Images..." -ForegroundColor Yellow
docker rmi dress-dock-server:latest 2>$null
docker rmi dress-dock-client:latest 2>$null
Write-Host "✅ Docker images removed" -ForegroundColor Green

# 7. Stop CI/CD Tools
Write-Host "`n7️⃣ Stopping CI/CD Tools..." -ForegroundColor Yellow
docker-compose -f ci-cd/docker-compose-cicd.yml down -v 2>$null
Write-Host "✅ CI/CD tools stopped" -ForegroundColor Green

# 8. Clean Docker System (Optional)
Write-Host "`n8️⃣ Cleaning Docker System..." -ForegroundColor Yellow
$response = Read-Host "Do you want to clean unused Docker resources? (y/n)"
if ($response -eq 'y') {
    docker system prune -a --volumes -f
    Write-Host "✅ Docker system cleaned" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipped Docker system cleanup" -ForegroundColor Gray
}

Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Cyan
Write-Host "All resources have been removed." -ForegroundColor Green
```

Run with:
```powershell
.\cleanup-all.ps1
```

## 🔍 Verification Commands

### Verify Local Cleanup

```powershell
# Check Kind clusters
kind get clusters

# Check Docker images
docker images | Select-String "dress-dock"

# Check Docker containers
docker ps -a

# Check Docker volumes
docker volume ls
```

### Verify AWS Cleanup

```powershell
# Check EKS clusters
aws eks list-clusters --region us-east-1

# Check ECR repositories
aws ecr describe-repositories --region us-east-1

# Check EC2 instances
aws ec2 describe-instances `
  --region us-east-1 `
  --filters "Name=tag:kubernetes.io/cluster/dress-dock-cluster,Values=owned" `
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'

# Check VPCs
aws ec2 describe-vpcs `
  --region us-east-1 `
  --filters "Name=tag:alpha.eksctl.io/cluster-name,Values=dress-dock-cluster"

# Check Load Balancers
aws elbv2 describe-load-balancers --region us-east-1

# Check EBS Volumes
aws ec2 describe-volumes `
  --region us-east-1 `
  --filters "Name=tag:kubernetes.io/cluster/dress-dock-cluster,Values=owned"
```

## 💰 Cost Verification (AWS)

### Check for Remaining Resources

```powershell
# Generate cost report
aws ce get-cost-and-usage `
  --time-period Start=2025-10-01,End=2025-10-05 `
  --granularity DAILY `
  --metrics "UnblendedCost" `
  --group-by Type=SERVICE

# Check for running instances
aws ec2 describe-instances `
  --region us-east-1 `
  --filters "Name=instance-state-name,Values=running" `
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime]'

# Check for active load balancers
aws elbv2 describe-load-balancers `
  --region us-east-1 `
  --query 'LoadBalancers[*].[LoadBalancerName,State.Code,CreatedTime]'
```

## 🚨 Emergency Cleanup

### Force Delete Everything

```powershell
# Nuclear option - removes everything
Write-Host "⚠️  WARNING: This will delete EVERYTHING!" -ForegroundColor Red
$confirm = Read-Host "Type 'DELETE' to confirm"

if ($confirm -eq 'DELETE') {
    # Delete all Kind clusters
    kind get clusters | ForEach-Object { kind delete cluster --name $_ }
    
    # Stop all containers
    docker stop $(docker ps -aq)
    
    # Remove all containers
    docker rm $(docker ps -aq)
    
    # Remove all images
    docker rmi $(docker images -q) -f
    
    # Remove all volumes
    docker volume rm $(docker volume ls -q)
    
    # Remove all networks
    docker network prune -f
    
    # Clean system
    docker system prune -a --volumes -f
    
    Write-Host "✅ Everything deleted!" -ForegroundColor Green
} else {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
}
```

## 📝 Cleanup Checklist

### Local Kind Cleanup
- [ ] Delete Kubernetes resources
- [ ] Delete ingress controller
- [ ] Delete Kind cluster
- [ ] Remove Docker images
- [ ] Clean Docker volumes
- [ ] Verify no resources remain

### AWS EKS Cleanup
- [ ] Delete Kubernetes resources
- [ ] Delete load balancer controller
- [ ] Delete EKS cluster
- [ ] Delete ECR repositories
- [ ] Delete IAM policies
- [ ] Verify no resources remain
- [ ] Check AWS billing

### CI/CD Cleanup
- [ ] Stop CI/CD containers
- [ ] Remove Docker volumes
- [ ] Clean Jenkins data
- [ ] Clean SonarQube data

### Monitoring Cleanup
- [ ] Uninstall Prometheus
- [ ] Delete monitoring namespace
- [ ] Clean persistent volumes

### ArgoCD Cleanup
- [ ] Delete ArgoCD application
- [ ] Uninstall ArgoCD
- [ ] Delete namespace

## 🔄 Partial Cleanup

### Keep Cluster, Remove Application

```powershell
# Only delete application resources
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/mongodb.yaml
kubectl delete -f k8s/server-deployment.yaml
kubectl delete -f k8s/client-deployment.yaml
kubectl delete -f k8s/services.yaml
kubectl delete -f k8s/ingress.yaml

# Cluster and ingress controller remain
```

### Keep Images, Remove Cluster

```powershell
# Delete cluster but keep images for faster rebuild
kind delete cluster --name dress-dock-cluster

# Images remain in Docker
docker images | Select-String "dress-dock"
```

## 🛠️ Troubleshooting Cleanup

### Resources Won't Delete

```powershell
# Force delete pods
kubectl delete pod <pod-name> --grace-period=0 --force

# Force delete namespace
kubectl delete namespace <namespace> --grace-period=0 --force

# If still stuck, edit and remove finalizers
kubectl edit namespace <namespace>
# Remove finalizers section and save
```

### Kind Cluster Won't Delete

```powershell
# List Docker containers
docker ps -a | Select-String "kind"

# Force remove kind containers
docker rm -f <container-id>

# Remove kind network
docker network rm kind
```

### Docker Images Won't Delete

```powershell
# Stop all containers using the image
docker ps -a | Select-String "dress-dock"
docker stop <container-id>
docker rm <container-id>

# Force remove image
docker rmi -f dress-dock-server:latest
```

## 📚 Additional Resources

- **Deployment Guide**: [deployment/LOCAL_KIND_DEPLOYMENT.md](deployment/LOCAL_KIND_DEPLOYMENT.md)
- **AWS Guide**: [deployment/AWS_EKS_DEPLOYMENT.md](deployment/AWS_EKS_DEPLOYMENT.md)
- **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

**Clean up responsibly! 🧹✨**
