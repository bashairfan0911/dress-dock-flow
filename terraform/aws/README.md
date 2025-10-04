# Terraform - AWS EKS Deployment

Deploy Dress Dock Flow to AWS EKS using Terraform.

## 📋 Prerequisites

- Terraform >= 1.0
- AWS CLI configured with credentials
- kubectl installed
- Docker installed

## 🚀 Quick Start

### 1. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### 2. Initialize Terraform
```bash
terraform init
```

### 3. Configure Variables
```bash
# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
# IMPORTANT: Change passwords!
```

### 4. Plan Deployment
```bash
terraform plan
```

### 5. Deploy Infrastructure
```bash
terraform apply
```

This creates:
- VPC with public/private subnets
- EKS cluster
- Node group with 2-4 nodes
- ECR repositories
- IAM roles and policies
- Load balancer controller
- EBS CSI driver
- MongoDB StatefulSet

**Note:** This takes 15-20 minutes.

### 6. Configure kubectl
```bash
aws eks update-kubeconfig --region us-east-1 --name dress-dock-cluster
```

### 7. Build and Push Images
```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push server
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/dress-dock-cluster-server:latest -f Dockerfile.server .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/dress-dock-cluster-server:latest

# Build and push client
docker build -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/dress-dock-cluster-client:latest -f Dockerfile.client .
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/dress-dock-cluster-client:latest
```

### 8. Deploy Application
```bash
# Update k8s manifests with ECR URLs
# Then apply
kubectl apply -f k8s/
```

### 9. Get Load Balancer URL
```bash
kubectl get ingress
# Wait for ADDRESS to be assigned
```

## 💰 Cost Estimation

Approximate monthly costs (us-east-1):
- EKS Cluster: $73
- EC2 Nodes (2x t3.medium): ~$60
- NAT Gateway: ~$32
- Load Balancer: ~$16
- EBS Volumes: ~$10
- **Total: ~$191/month**

Cost optimization:
- Use single NAT gateway (default)
- Use t3.medium instances
- Enable cluster autoscaler
- Use Spot instances for non-prod

## 🔧 Configuration

### terraform.tfvars
```hcl
aws_region         = "us-east-1"
cluster_name       = "dress-dock-cluster"
kubernetes_version = "1.28"

# Node configuration
node_group_min_size     = 2
node_group_max_size     = 4
node_group_desired_size = 2
node_instance_types     = ["t3.medium"]

# Cost optimization
single_nat_gateway = true  # false for HA

# Passwords
mongodb_root_password = "your-secure-password"
mongodb_password      = "your-secure-password"
```

## 📊 Verify Deployment

```bash
# Check cluster
aws eks describe-cluster --name dress-dock-cluster --region us-east-1

# Check nodes
kubectl get nodes

# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress
```

## 🧹 Cleanup

```bash
# Delete application first
kubectl delete -f k8s/

# Destroy infrastructure
terraform destroy
```

**Important:** Ensure all LoadBalancers and PVCs are deleted before destroying Terraform resources.

## 🔍 Troubleshooting

### Cluster creation fails
```bash
# Check AWS limits
aws service-quotas list-service-quotas --service-code eks

# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name <stack-name>
```

### Nodes not joining
```bash
# Check node group
aws eks describe-nodegroup --cluster-name dress-dock-cluster --nodegroup-name <nodegroup-name>

# Check IAM roles
aws iam get-role --role-name <role-name>
```

### Load balancer not created
```bash
# Check controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller

# Check IAM role
kubectl describe sa aws-load-balancer-controller -n kube-system
```

### ECR push fails
```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Check repository exists
aws ecr describe-repositories --region us-east-1
```

## 🎯 Advanced Configuration

### Enable cluster autoscaler
```bash
# Add to terraform
# See: https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler
```

### Enable monitoring
```bash
# Install Prometheus/Grafana
helm install prometheus prometheus-community/kube-prometheus-stack
```

### Enable logging
```bash
# Enable CloudWatch Container Insights
# See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-EKS-quickstart.html
```

### Use Spot instances
```hcl
# In terraform.tfvars
capacity_type = "SPOT"
```

## 📚 Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest)
