# Terraform Infrastructure Guide

Complete guide for deploying Dress Dock Flow using Terraform Infrastructure as Code.

## 📁 Structure

```
terraform/
├── local/                      # Local Kind cluster
│   ├── main.tf                # Main configuration
│   ├── variables.tf           # Input variables
│   ├── outputs.tf             # Output values
│   ├── terraform.tfvars.example
│   └── README.md
├── aws/                       # AWS EKS cluster
│   ├── main.tf                # Main configuration
│   ├── variables.tf           # Input variables
│   ├── outputs.tf             # Output values
│   ├── terraform.tfvars.example
│   └── README.md
└── .gitignore
```

## 🎯 Why Terraform?

### Benefits
- **Infrastructure as Code**: Version control your infrastructure
- **Reproducible**: Deploy identical environments
- **Declarative**: Describe what you want, not how to get it
- **State Management**: Track resource changes
- **Plan Before Apply**: Preview changes before execution
- **Modular**: Reusable components
- **Multi-Cloud**: Same tool for different providers

### Use Cases
- Consistent dev/staging/prod environments
- Disaster recovery
- Multi-region deployments
- Team collaboration
- Compliance and auditing

## 🚀 Quick Start

### Local Kind Deployment
```bash
cd terraform/local
terraform init
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
terraform plan
terraform apply
```

### AWS EKS Deployment
```bash
cd terraform/aws
terraform init
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars (change passwords!)
terraform plan
terraform apply
```

## 📋 Prerequisites

### All Deployments
- Terraform >= 1.0
- kubectl

### Local Kind
- Docker Desktop

### AWS EKS
- AWS CLI configured
- AWS credentials with appropriate permissions

## 🔧 Configuration

### Local Kind Variables

```hcl
# terraform/local/terraform.tfvars
cluster_name           = "dress-dock-cluster"
namespace              = "default"
mongodb_root_password  = "secure-password-123"
mongodb_password       = "secure-password-456"
server_replicas        = 2
client_replicas        = 2
```

### AWS EKS Variables

```hcl
# terraform/aws/terraform.tfvars
aws_region              = "us-east-1"
cluster_name            = "dress-dock-cluster"
kubernetes_version      = "1.28"
environment             = "production"

# VPC
vpc_cidr                = "10.0.0.0/16"
private_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
single_nat_gateway      = true

# Nodes
node_group_min_size     = 2
node_group_max_size     = 4
node_group_desired_size = 2
node_instance_types     = ["t3.medium"]

# Passwords
mongodb_root_password   = "change-me-123"
mongodb_password        = "change-me-456"

# Tags
tags = {
  Project     = "dress-dock-flow"
  Environment = "production"
  ManagedBy   = "terraform"
}
```

## 📊 Terraform Workflow

### 1. Initialize
```bash
terraform init
```
Downloads providers and modules.

### 2. Plan
```bash
terraform plan
```
Shows what will be created/changed/destroyed.

### 3. Apply
```bash
terraform apply
```
Creates/updates infrastructure.

### 4. Show
```bash
terraform show
```
Displays current state.

### 5. Destroy
```bash
terraform destroy
```
Removes all resources.

## 🎨 What Gets Created

### Local Kind
- Kind cluster (3 nodes)
- MongoDB deployment
- Server deployment (2 replicas)
- Client deployment (2 replicas)
- Services (ClusterIP)
- NGINX Ingress Controller
- Ingress rules
- Secrets
- Database seeding

### AWS EKS
- VPC with public/private subnets
- NAT Gateway
- Internet Gateway
- EKS cluster
- Node group (2-4 nodes)
- ECR repositories (server, client)
- IAM roles and policies
- Security groups
- AWS Load Balancer Controller
- EBS CSI Driver
- MongoDB StatefulSet with EBS volume
- Secrets

## 💡 Best Practices

### Security
```hcl
# Never commit terraform.tfvars
# Use sensitive = true for passwords
variable "mongodb_password" {
  type      = string
  sensitive = true
}

# Use AWS Secrets Manager for production
# Use separate state files per environment
```

### State Management
```hcl
# Use remote state for teams
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "dress-dock/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### Workspaces
```bash
# Create environments
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch environments
terraform workspace select prod
```

### Modules
```hcl
# Reusable components
module "mongodb" {
  source = "./modules/mongodb"
  
  namespace = var.namespace
  password  = var.mongodb_password
}
```

## 🔍 Troubleshooting

### State Lock Issues
```bash
# Force unlock (use carefully!)
terraform force-unlock <lock-id>
```

### Provider Issues
```bash
# Upgrade providers
terraform init -upgrade

# Reconfigure
terraform init -reconfigure
```

### State Drift
```bash
# Refresh state
terraform refresh

# Import existing resource
terraform import kubernetes_namespace.app default
```

### Debugging
```bash
# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# Disable
unset TF_LOG
```

## 📈 Advanced Usage

### Conditional Resources
```hcl
resource "kubernetes_ingress_v1" "app" {
  count = var.enable_ingress ? 1 : 0
  # ...
}
```

### Dynamic Blocks
```hcl
dynamic "node" {
  for_each = var.worker_nodes
  content {
    role = "worker"
  }
}
```

### Data Sources
```hcl
data "aws_availability_zones" "available" {
  state = "available"
}
```

### Locals
```hcl
locals {
  common_tags = {
    Project   = "dress-dock-flow"
    ManagedBy = "terraform"
  }
}
```

## 🎯 Common Commands

```bash
# Format code
terraform fmt

# Validate configuration
terraform validate

# Show outputs
terraform output

# Target specific resource
terraform apply -target=kubernetes_deployment.server

# Import existing resource
terraform import kubernetes_namespace.app default

# Taint resource (force recreation)
terraform taint kubernetes_deployment.server

# Untaint resource
terraform untaint kubernetes_deployment.server

# Show state
terraform state list
terraform state show kubernetes_deployment.server

# Move resource in state
terraform state mv kubernetes_deployment.old kubernetes_deployment.new

# Remove from state (doesn't delete resource)
terraform state rm kubernetes_deployment.server
```

## 💰 Cost Management (AWS)

### Estimate Costs
```bash
# Use Infracost
infracost breakdown --path .

# AWS Calculator
# https://calculator.aws/
```

### Optimize Costs
```hcl
# Use Spot instances
capacity_type = "SPOT"

# Single NAT gateway
single_nat_gateway = true

# Smaller instances
node_instance_types = ["t3.small"]

# Auto-scaling
node_group_min_size = 1
node_group_max_size = 3
```

## 🔐 Security Checklist

- [ ] Passwords in terraform.tfvars (not committed)
- [ ] Sensitive variables marked as sensitive
- [ ] State file secured (S3 with encryption)
- [ ] IAM roles follow least privilege
- [ ] Security groups properly configured
- [ ] Secrets in Kubernetes secrets (not ConfigMaps)
- [ ] ECR image scanning enabled
- [ ] VPC flow logs enabled (production)
- [ ] CloudTrail enabled (production)

## 📚 Resources

### Terraform
- [Terraform Documentation](https://www.terraform.io/docs)
- [Terraform Registry](https://registry.terraform.io/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

### Providers
- [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [Helm Provider](https://registry.terraform.io/providers/hashicorp/helm/latest/docs)
- [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kind Provider](https://registry.terraform.io/providers/tehcyx/kind/latest/docs)

### Modules
- [AWS VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)
- [AWS EKS Module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest)

## 🎊 Comparison: Terraform vs Manual

| Aspect | Manual | Terraform |
|--------|--------|-----------|
| Setup Time | 30-60 min | 15-20 min |
| Reproducibility | Low | High |
| Version Control | No | Yes |
| Team Collaboration | Difficult | Easy |
| Disaster Recovery | Manual | Automated |
| Documentation | Separate | Code is docs |
| State Tracking | Manual | Automatic |
| Change Preview | No | Yes (plan) |
| Rollback | Difficult | Easy |
| Multi-Environment | Manual | Workspaces |

## 🚀 Next Steps

1. **Start with Local**: Test with Kind first
2. **Customize**: Adjust variables for your needs
3. **Version Control**: Commit Terraform files (not .tfvars)
4. **Remote State**: Set up S3 backend for teams
5. **CI/CD**: Integrate with Jenkins/GitHub Actions
6. **Monitoring**: Add Prometheus/Grafana modules
7. **Production**: Deploy to AWS EKS
8. **Scale**: Add autoscaling and multi-region

## 🎯 Quick Reference

```bash
# Local Kind
cd terraform/local && terraform init && terraform apply

# AWS EKS
cd terraform/aws && terraform init && terraform apply

# Destroy
terraform destroy

# View outputs
terraform output

# Format code
terraform fmt -recursive

# Validate
terraform validate
```

---

**Ready to deploy with Terraform!** 🚀
