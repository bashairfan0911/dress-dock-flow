# AWS EKS Deployment Guide

## 🚀 Complete Guide to Deploy on Amazon EKS

This guide walks you through deploying the Dress Dock Flow application on Amazon Elastic Kubernetes Service (EKS).

## 📋 Prerequisites

### Required Tools
- **AWS CLI** - AWS Command Line Interface
- **eksctl** - EKS cluster management tool
- **kubectl** - Kubernetes CLI
- **Helm** - Package manager for Kubernetes
- **Docker** - Container runtime
- **Git** - Version control

### AWS Account Requirements
- AWS Account with appropriate permissions
- IAM user with EKS, EC2, VPC, CloudFormation permissions
- AWS Access Key ID and Secret Access Key

### Installation

#### Windows (using Chocolatey):
```powershell
choco install awscli
choco install eksctl
choco install kubernetes-cli
choco install kubernetes-helm
choco install docker-desktop
choco install git
```

#### Linux:
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

#### Mac (using Homebrew):
```bash
brew install awscli
brew install eksctl
brew install kubectl
brew install helm
brew install docker
brew install git
```

## 🔐 Step 1: Configure AWS CLI

```powershell
# Configure AWS credentials
aws configure

# Enter your credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

## 🏗️ Step 2: Create EKS Cluster

### Option A: Using eksctl (Recommended)

Create cluster configuration file:

```yaml
# eks-cluster-config.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: dress-dock-cluster
  region: us-east-1
  version: "1.28"

managedNodeGroups:
  - name: dress-dock-nodes
    instanceType: t3.medium
    desiredCapacity: 3
    minSize: 2
    maxSize: 5
    volumeSize: 20
    ssh:
      allow: true
    labels:
      role: worker
    tags:
      Environment: production
      Application: dress-dock-flow

iam:
  withOIDC: true

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
  - name: aws-ebs-csi-driver
```

Create the cluster:

```powershell
# Create cluster (takes 15-20 minutes)
eksctl create cluster -f eks-cluster-config.yaml

# Verify cluster
kubectl get nodes
kubectl cluster-info
```

### Option B: Using AWS Console

1. Go to **AWS Console** → **EKS**
2. Click **Create cluster**
3. Configure:
   - Name: `dress-dock-cluster`
   - Kubernetes version: `1.28`
   - Role: Create new or select existing
4. Configure networking (VPC, subnets, security groups)
5. Create cluster
6. Add node group:
   - Name: `dress-dock-nodes`
   - Instance type: `t3.medium`
   - Desired size: 3

Update kubeconfig:
```powershell
aws eks update-kubeconfig --region us-east-1 --name dress-dock-cluster
```

## 📦 Step 3: Set Up Container Registry (ECR)

```powershell
# Create ECR repositories
aws ecr create-repository --repository-name dress-dock-server --region us-east-1
aws ecr create-repository --repository-name dress-dock-client --region us-east-1

# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Set variables
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$AWS_REGION = "us-east-1"
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

## 🐳 Step 4: Build and Push Docker Images

```powershell
# Build images
docker build -t dress-dock-server:latest -f Dockerfile.server .
docker build -t dress-dock-client:latest -f Dockerfile.client .

# Tag images for ECR
docker tag dress-dock-server:latest $ECR_REGISTRY/dress-dock-server:latest
docker tag dress-dock-client:latest $ECR_REGISTRY/dress-dock-client:latest

# Push to ECR
docker push $ECR_REGISTRY/dress-dock-server:latest
docker push $ECR_REGISTRY/dress-dock-client:latest

# Verify images in ECR
aws ecr describe-images --repository-name dress-dock-server --region us-east-1
aws ecr describe-images --repository-name dress-dock-client --region us-east-1
```

## 📝 Step 5: Update Kubernetes Manifests

Update image references in deployment files:

```powershell
# Update server deployment
$serverImage = "$ECR_REGISTRY/dress-dock-server:latest"
(Get-Content k8s/server-deployment.yaml) -replace 'image: dress-dock-server:latest', "image: $serverImage" | Set-Content k8s/server-deployment.yaml

# Update client deployment
$clientImage = "$ECR_REGISTRY/dress-dock-client:latest"
(Get-Content k8s/client-deployment.yaml) -replace 'image: dress-dock-client:latest', "image: $clientImage" | Set-Content k8s/client-deployment.yaml
```

## 🚀 Step 6: Deploy Application to EKS

### Deploy MongoDB

```powershell
# Create storage class for EBS
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
EOF

# Deploy MongoDB with persistent storage
kubectl apply -f k8s/mongodb.yaml

# Wait for MongoDB
kubectl wait --for=condition=Ready pod -l app=mongodb --timeout=300s
```

### Deploy Secrets

```powershell
kubectl apply -f k8s/secrets.yaml
```

### Deploy Application

```powershell
# Deploy server
kubectl apply -f k8s/server-deployment.yaml

# Deploy client
kubectl apply -f k8s/client-deployment.yaml

# Deploy services
kubectl apply -f k8s/services.yaml

# Wait for deployments
kubectl wait --for=condition=Available deployment/dress-dock-server --timeout=300s
kubectl wait --for=condition=Available deployment/dress-dock-client --timeout=300s

# Verify pods
kubectl get pods
```

## 🌐 Step 7: Set Up Load Balancer and Ingress

### Install AWS Load Balancer Controller

```powershell
# Create IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.0/docs/install/iam_policy.json

aws iam create-policy `
    --policy-name AWSLoadBalancerControllerIAMPolicy `
    --policy-document file://iam_policy.json

# Create IAM service account
eksctl create iamserviceaccount `
  --cluster=dress-dock-cluster `
  --namespace=kube-system `
  --name=aws-load-balancer-controller `
  --role-name AmazonEKSLoadBalancerControllerRole `
  --attach-policy-arn=arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy `
  --approve

# Install controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller `
  -n kube-system `
  --set clusterName=dress-dock-cluster `
  --set serviceAccount.create=false `
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
```

### Create Ingress with ALB

Create `k8s/ingress-aws.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dress-dock-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/healthcheck-path: /api/health
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: dress-dock-server
                port:
                  number: 5000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: dress-dock-client
                port:
                  number: 80
```

Apply ingress:

```powershell
kubectl apply -f k8s/ingress-aws.yaml

# Get ALB URL
kubectl get ingress dress-dock-ingress
```

Wait a few minutes for ALB to be provisioned, then access your application at the ALB URL.

## 🔒 Step 8: Set Up HTTPS (Optional)

### Request SSL Certificate

```powershell
# Request certificate in ACM
aws acm request-certificate `
    --domain-name yourdomain.com `
    --validation-method DNS `
    --region us-east-1

# Get certificate ARN
aws acm list-certificates --region us-east-1
```

### Update Ingress for HTTPS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dress-dock-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
spec:
  # ... rest of config
```

## 📊 Step 9: Install Monitoring

```powershell
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack `
  -n monitoring `
  -f monitoring/prometheus-values-aws.yaml

# Wait for monitoring stack
kubectl wait --for=condition=Ready pods --all -n monitoring --timeout=600s

# Expose Grafana via LoadBalancer
kubectl patch svc prometheus-grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'

# Get Grafana URL
kubectl get svc prometheus-grafana -n monitoring
```

## 🔄 Step 10: Set Up ArgoCD

```powershell
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Expose ArgoCD via LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get ArgoCD URL
kubectl get svc argocd-server -n argocd

# Get initial password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

# Apply application
kubectl apply -f k8s/argocd/application.yaml
```

## 🗄️ Step 11: Seed Database

```powershell
# Get server pod name
$podName = (kubectl get pods -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')

# Run seed script
kubectl exec $podName -- node seed.js

# Verify products
$albUrl = (kubectl get ingress dress-dock-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl "http://$albUrl/api/products"
```

## 📊 Verify Deployment

```powershell
# Check all resources
kubectl get all

# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# Check logs
kubectl logs -l app=dress-dock-server --tail=50
kubectl logs -l app=dress-dock-client --tail=50

# Test endpoints
$albUrl = (kubectl get ingress dress-dock-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl "http://$albUrl/api/health"
curl "http://$albUrl/api/products"
```

## 💰 Cost Optimization

### Use Spot Instances

```yaml
# Add to eks-cluster-config.yaml
managedNodeGroups:
  - name: dress-dock-spot-nodes
    instanceTypes: ["t3.medium", "t3a.medium"]
    spot: true
    desiredCapacity: 2
    minSize: 1
    maxSize: 4
```

### Enable Cluster Autoscaler

```powershell
# Install cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure autoscaler
kubectl -n kube-system annotate deployment.apps/cluster-autoscaler cluster-autoscaler.kubernetes.io/safe-to-evict="false"

kubectl -n kube-system set image deployment.apps/cluster-autoscaler cluster-autoscaler=k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0
```

### Set Resource Limits

Ensure all deployments have resource requests and limits set (already configured in deployment files).

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

### Cannot Pull Images from ECR

```powershell
# Verify ECR permissions
aws ecr get-login-password --region us-east-1

# Check if images exist
aws ecr describe-images --repository-name dress-dock-server

# Verify node IAM role has ECR permissions
aws iam list-attached-role-policies --role-name <node-role-name>
```

### Load Balancer Not Created

```powershell
# Check AWS Load Balancer Controller
kubectl get deployment -n kube-system aws-load-balancer-controller

# Check controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Verify IAM permissions
aws iam get-policy --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy
```

### High Costs

```powershell
# Check running resources
kubectl get nodes
kubectl top nodes
kubectl top pods

# Scale down if needed
kubectl scale deployment dress-dock-server --replicas=1
kubectl scale deployment dress-dock-client --replicas=1

# Delete unused resources
kubectl delete -f k8s/
```

## 🔄 Update Deployment

```powershell
# Build new images
docker build -t dress-dock-server:v2 -f Dockerfile.server .
docker build -t dress-dock-client:v2 -f Dockerfile.client .

# Tag and push
docker tag dress-dock-server:v2 $ECR_REGISTRY/dress-dock-server:v2
docker tag dress-dock-client:v2 $ECR_REGISTRY/dress-dock-client:v2
docker push $ECR_REGISTRY/dress-dock-server:v2
docker push $ECR_REGISTRY/dress-dock-client:v2

# Update deployments
kubectl set image deployment/dress-dock-server dress-dock-server=$ECR_REGISTRY/dress-dock-server:v2
kubectl set image deployment/dress-dock-client dress-dock-client=$ECR_REGISTRY/dress-dock-client:v2

# Watch rollout
kubectl rollout status deployment dress-dock-server
kubectl rollout status deployment dress-dock-client
```

## 🧹 Cleanup

### Delete Application

```powershell
# Delete k8s resources
kubectl delete -f k8s/

# Delete monitoring
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring

# Delete ArgoCD
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl delete namespace argocd
```

### Delete EKS Cluster

```powershell
# Delete cluster (this will delete all resources)
eksctl delete cluster --name dress-dock-cluster --region us-east-1

# Or if created via console, delete from AWS Console
```

### Delete ECR Repositories

```powershell
# Delete images first
aws ecr batch-delete-image --repository-name dress-dock-server --image-ids imageTag=latest
aws ecr batch-delete-image --repository-name dress-dock-client --image-ids imageTag=latest

# Delete repositories
aws ecr delete-repository --repository-name dress-dock-server --force
aws ecr delete-repository --repository-name dress-dock-client --force
```

## 📝 Quick Reference

```powershell
# Cluster Management
eksctl create cluster -f eks-cluster-config.yaml
eksctl delete cluster --name dress-dock-cluster
aws eks update-kubeconfig --name dress-dock-cluster --region us-east-1

# ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/<repo>:<tag>

# Deployment
kubectl apply -f k8s/
kubectl get all
kubectl get ingress
kubectl logs -l app=<label>

# Monitoring
kubectl top nodes
kubectl top pods
kubectl get events
```

## 💵 Cost Estimate

**Monthly costs (approximate):**
- EKS Cluster: $73/month
- EC2 Instances (3x t3.medium): ~$90/month
- EBS Volumes: ~$10/month
- Load Balancer: ~$20/month
- Data Transfer: Variable
- **Total: ~$193/month**

**Cost Savings:**
- Use Spot Instances: Save up to 70%
- Use Fargate: Pay only for pods
- Enable autoscaling: Scale down during low traffic

## 🎯 Next Steps

1. ✅ Create EKS cluster
2. ✅ Set up ECR
3. ✅ Build and push images
4. ✅ Deploy application
5. ✅ Set up load balancer
6. ✅ Configure monitoring
7. ✅ Set up ArgoCD
8. ✅ Configure autoscaling
9. ✅ Set up CI/CD pipeline
10. ✅ Configure backups

## 📚 Additional Resources

- **AWS EKS Documentation**: https://docs.aws.amazon.com/eks/
- **eksctl Documentation**: https://eksctl.io/
- **AWS Load Balancer Controller**: https://kubernetes-sigs.github.io/aws-load-balancer-controller/

---

**Your application is now running on AWS EKS!** ☁️🚀
