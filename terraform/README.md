# Terraform Infrastructure for Dress Dock Flow

This directory contains Terraform configurations for deploying the Dress Dock Flow application infrastructure.

## 📁 Structure

```
terraform/
├── local/              # Local Kind cluster setup
├── aws/                # AWS EKS cluster setup
└── modules/            # Reusable Terraform modules
```

## 🚀 Quick Start

### Local Kind Deployment
```bash
cd terraform/local
terraform init
terraform plan
terraform apply
```

### AWS EKS Deployment
```bash
cd terraform/aws
terraform init
terraform plan
terraform apply
```

## 📋 Prerequisites

- Terraform >= 1.0
- Docker (for local)
- AWS CLI configured (for AWS)
- kubectl

## 🧹 Cleanup

```bash
terraform destroy
```

See individual directories for detailed instructions.
