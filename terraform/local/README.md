# Terraform - Local Kind Deployment

Deploy Dress Dock Flow to a local Kind cluster using Terraform.

## 📋 Prerequisites

- Terraform >= 1.0
- Docker Desktop running
- kubectl installed

## 🚀 Quick Start

### 1. Initialize Terraform
```bash
terraform init
```

### 2. Review Configuration
```bash
# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# Change passwords!
```

### 3. Plan Deployment
```bash
terraform plan
```

### 4. Deploy
```bash
terraform apply
```

This will:
- Create a Kind cluster with 3 nodes
- Build Docker images
- Load images into Kind
- Deploy MongoDB
- Deploy server and client
- Install NGINX Ingress
- Seed database with sample data

### 5. Access Application
```bash
# Frontend
http://localhost/

# API
http://localhost/api/products

# Health check
http://localhost/api/health
```

## 📊 Verify Deployment

```bash
# Check cluster
kind get clusters

# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -f -l app=dress-dock-server
```

## 🔧 Customization

Edit `terraform.tfvars`:

```hcl
cluster_name      = "my-cluster"
namespace         = "my-namespace"
server_replicas   = 3
client_replicas   = 3
```

## 🧹 Cleanup

```bash
# Destroy all resources
terraform destroy

# Or manually
kind delete cluster --name dress-dock-cluster
```

## 📝 What Gets Created

- Kind cluster with 3 nodes (1 control-plane, 2 workers)
- MongoDB deployment with persistent storage
- Server deployment (2 replicas)
- Client deployment (2 replicas)
- Services for all components
- NGINX Ingress Controller
- Ingress rules for routing

## 🔍 Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Images not loading
```bash
# Rebuild and reload
docker build -t dress-dock-server:latest -f ../../Dockerfile.server ../..
kind load docker-image dress-dock-server:latest --name dress-dock-cluster
```

### Ingress not working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress dress-dock-ingress
```

## 🎯 Advanced Usage

### Update deployment
```bash
# Modify terraform files
terraform plan
terraform apply
```

### Scale replicas
```bash
# Edit terraform.tfvars
server_replicas = 5
client_replicas = 5

# Apply changes
terraform apply
```

### View Terraform state
```bash
terraform show
terraform state list
```

## 📚 Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Kind Documentation](https://kind.sigs.k8s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
