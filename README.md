# Dress Dock Flow

A modern e-commerce platform built with React, TypeScript, and MongoDB.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [MongoDB Setup](#mongodb-setup)
- [Docker Configuration](#docker-configuration)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Terraform Infrastructure](#terraform-infrastructure)
- [ArgoCD Integration](#argocd-integration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

## Features
- User authentication and authorization
- Role-based access control (Admin/User)
- Product management
- Shopping cart functionality
- Order processing
- Responsive design
- Admin dashboard

## Tech Stack
- Vite
- TypeScript
- React
- MongoDB & Mongoose
- shadcn-ui
- Tailwind CSS
- Docker
- Kubernetes
- ArgoCD (GitOps)

## Getting Started

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- MongoDB (local or Atlas)
- Docker (optional)
- Kubernetes cluster (optional)

### Local Development Setup

1. Clone the repository:
```sh
git clone https://github.com/IrfanBasha-03/dress-dock-flow.git
cd dress-dock-flow
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/dress-dock-flow
JWT_SECRET=your-secret-key-change-this-in-production
```

4. Start the development server:
```sh
npm run dev
```

## MongoDB Setup

### Local MongoDB Setup
1. Install MongoDB Community Server
2. Start MongoDB service
3. Create a new database:
```sh
mongosh
use dress-dock-flow
```

### MongoDB Atlas Setup
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Get your connection string
4. Update `.env` file with your connection string

### Database Models
- Users (Authentication & Authorization)
- Products (Product Management)
- Orders (Order Processing)

### Model Schemas

#### User Schema
```typescript
{
  email: string;     // Required, unique
  name: string;      // Required
  password: string;  // Required, hashed
  role: string;      // 'user' or 'admin'
  createdAt: Date;   // Auto-generated
}
```

#### Product Schema
```typescript
{
  name: string;        // Required
  description: string; // Required
  price: number;      // Required
  stock: number;      // Required
  image_url: string;  // Required
  createdAt: Date;    // Auto-generated
}
```

#### Order Schema
```typescript
{
  user: ObjectId;     // Reference to User
  products: [{
    product: ObjectId, // Reference to Product
    quantity: number
  }];
  total: number;      // Required
  status: string;     // pending/processing/shipped/delivered
  createdAt: Date;    // Auto-generated
}
```

## Docker Configuration

This project includes Docker support for easy deployment and consistent development environments. Follow these steps to run the application using Docker:

### Prerequisites

- Install [Docker](https://www.docker.com/get-started) on your machine

### Build and Run with Docker

```sh
# Build the Docker image
docker build -t dress-dock-flow .

# Run the container
# This will start the application on http://localhost:3000
docker run -d -p 3000:80 dress-dock-flow
```

### Useful Docker Commands

```sh
# List running containers
docker ps

# Stop the container
docker stop <container-id>

# Remove the container
docker rm <container-id>

# View container logs
docker logs <container-id>

# Remove the image
docker rmi dress-dock-flow
```

### Development vs Production

- The Docker configuration uses a multi-stage build process to optimize the image size
- The production image uses Nginx to serve the static files efficiently
- The application runs on port 80 inside the container, mapped to port 3000 on your host machine

## Kubernetes Deployment

This project includes Kubernetes manifests for container orchestration. The configuration files are located in the `k8s` directory.

### Prerequisites

- Install [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Access to a Kubernetes cluster (or [Minikube](https://minikube.sigs.k8s.io/docs/start/) for local development)

### Deploying to Kubernetes

```sh
# Apply the Kubernetes configurations
kubectl apply -f k8s/

# Verify the deployment
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# Check pod logs
kubectl logs -l app=dress-dock-flow

# Scale the deployment
kubectl scale deployment dress-dock-flow --replicas=5
```

### Configuration Details

- **Deployment**: Creates 3 replicas of the application with resource limits and health checks
- **Service**: Exposes the application within the cluster
- **Ingress**: Configures external access to the service

### Cleanup

```sh
# Remove all resources
kubectl delete -f k8s/
```

## Terraform Infrastructure

This project includes comprehensive Terraform configurations for Infrastructure as Code (IaC) deployment.

### Quick Start with Terraform

#### Local Kind Cluster
```sh
cd terraform/local
terraform init
terraform apply
```

#### AWS EKS Cluster
```sh
cd terraform/aws
terraform init
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform apply
```

### What Terraform Deploys

**Local Kind:**
- Kind cluster with 3 nodes
- MongoDB deployment
- Server and client deployments
- NGINX Ingress Controller
- Automatic image building and loading
- Database seeding

**AWS EKS:**
- VPC with public/private subnets
- EKS cluster with managed node groups
- ECR repositories
- IAM roles and policies
- AWS Load Balancer Controller
- EBS CSI Driver
- MongoDB StatefulSet with persistent storage

### Benefits of Using Terraform

- **Version Control**: Infrastructure changes tracked in Git
- **Reproducible**: Deploy identical environments consistently
- **Plan Before Apply**: Preview changes before execution
- **State Management**: Track resource changes automatically
- **Modular**: Reusable components across environments
- **Multi-Cloud**: Same tool for local and cloud deployments

### Documentation

See [TERRAFORM_GUIDE.md](TERRAFORM_GUIDE.md) for comprehensive documentation including:
- Detailed configuration options
- Best practices
- Cost optimization
- Troubleshooting
- Advanced usage patterns

### Cleanup

```sh
# Destroy all Terraform-managed resources
terraform destroy
```

## ArgoCD Integration

This project includes ArgoCD configuration for GitOps-based continuous delivery. The ArgoCD configuration is located in the `k8s/argocd` directory.

### Prerequisites

1. Install ArgoCD in your cluster:
```sh
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd
```

2. Access the ArgoCD UI:
```sh
# Port forward the ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Deploy with ArgoCD

1. Apply the ArgoCD application manifest:
```sh
kubectl apply -f k8s/argocd/application.yaml
```

2. Verify the deployment in ArgoCD:
- Open ArgoCD UI at https://localhost:8080
- Login with username: admin and the password retrieved above
- You should see your application synchronized automatically

### Features

- **Automated Sync**: Changes in the Git repository are automatically applied to the cluster
- **Self-Healing**: ArgoCD will correct any manual changes made to the cluster
- **Pruning**: Removed resources from Git are automatically removed from the cluster
- **Namespace Creation**: Automatically creates the target namespace if it doesn't exist

### Managing the Application

```sh
# Get ArgoCD application status
kubectl get applications -n argocd

# Force sync the application
kubectl argocd app sync dress-dock-flow -n argocd

# Delete the application
kubectl delete -f k8s/argocd/application.yaml
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Docker
- Kubernetes
- ArgoCD (GitOps)
# Wait for ArgoCD pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd
```

2. Access the ArgoCD UI:
```sh
# Port forward the ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### Deploy with ArgoCD

1. Apply the ArgoCD application manifest:
```sh
kubectl apply -f k8s/argocd/application.yaml
```

2. Verify the deployment in ArgoCD:
- Open ArgoCD UI at https://localhost:8080
- Login with username: admin and the password retrieved above
- You should see your application synchronized automatically

### Features

- **Automated Sync**: Changes in the Git repository are automatically applied to the cluster
- **Self-Healing**: ArgoCD will correct any manual changes made to the cluster
- **Pruning**: Removed resources from Git are automatically removed from the cluster
- **Namespace Creation**: Automatically creates the target namespace if it doesn't exist

### Managing the Application

```sh
# Get ArgoCD application status
kubectl get applications -n argocd

# Force sync the application
kubectl argocd app sync dress-dock-flow -n argocd

# Delete the application
kubectl delete -f k8s/argocd/application.yaml
```

## CI/CD Pipeline

This project includes a complete CI/CD pipeline with Jenkins and SonarQube.

### Quick Start

```sh
# Start CI/CD tools
cd ci-cd
docker-compose -f docker-compose-cicd.yml up -d

# Access tools
# Jenkins: http://localhost:8080
# SonarQube: http://localhost:9000
```

See [CI-CD-SUMMARY.md](CI-CD-SUMMARY.md) and [ci-cd/CICD_SETUP_GUIDE.md](ci-cd/CICD_SETUP_GUIDE.md) for detailed setup instructions.

## Monitoring

Prometheus and Grafana monitoring stack included.

### Quick Start

```sh
# Install monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Default credentials: admin/prom-operator
```

See [monitoring/](monitoring/) directory for detailed configuration.

## Testing

Comprehensive testing guide available.

```sh
# Run all tests
.\test-all.ps1
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed testing procedures.

## Cleanup

Complete cleanup guide available.

```sh
# Clean up everything
.\cleanup-all.ps1
```

See [CLEANUP_GUIDE.md](CLEANUP_GUIDE.md) for detailed cleanup instructions.

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
dress-dock-flow/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/
│   │   └── db/        # MongoDB configuration and models
│   ├── pages/         # Application pages/routes
│   └── services/      # API services
├── k8s/               # Kubernetes manifests
│   └── argocd/        # ArgoCD configuration
├── terraform/         # Infrastructure as Code
│   ├── local/         # Local Kind deployment
│   └── aws/           # AWS EKS deployment
├── ci-cd/             # CI/CD configurations
│   ├── docker-compose-cicd.yml
│   └── CICD_SETUP_GUIDE.md
├── monitoring/        # Monitoring configurations
├── deployment/        # Deployment guides
├── public/            # Static assets
├── Jenkinsfile        # Jenkins pipeline
├── sonar-project.properties
├── deploy-kind.ps1    # Quick deployment script
├── cleanup-all.ps1    # Complete cleanup script
├── test-all.ps1       # Testing script
└── package.json       # Project dependencies and scripts
```

## 📚 Documentation

- [TERRAFORM_GUIDE.md](TERRAFORM_GUIDE.md) - Complete Terraform infrastructure guide
- [CLEANUP_GUIDE.md](CLEANUP_GUIDE.md) - Comprehensive cleanup instructions
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures and best practices
- [CI-CD-SUMMARY.md](CI-CD-SUMMARY.md) - CI/CD pipeline overview
- [deployment/LOCAL_KIND_DEPLOYMENT.md](deployment/LOCAL_KIND_DEPLOYMENT.md) - Local deployment guide
- [deployment/AWS_EKS_DEPLOYMENT.md](deployment/AWS_EKS_DEPLOYMENT.md) - AWS deployment guide
- [deployment/DEPLOYMENT_COMPARISON.md](deployment/DEPLOYMENT_COMPARISON.md) - Deployment options comparison

## 🚀 Quick Commands

```powershell
# Deploy everything (local)
.\deploy-kind.ps1

# Test everything
.\test-all.ps1

# Clean up everything
.\cleanup-all.ps1

# Deploy with Terraform (local)
cd terraform/local && terraform init && terraform apply

# Deploy with Terraform (AWS)
cd terraform/aws && terraform init && terraform apply
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [MongoDB](https://www.mongodb.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Kubernetes](https://kubernetes.io/)
- [ArgoCD](https://argoproj.github.io/cd/)

## Developer Troubleshooting

If you run into issues while developing locally, the following quick steps and tips will help:

- Start the backend server (from project root):

```powershell
cd server
# development with auto-restart
npm run dev
# or one-shot
npm start
```

- Start the frontend dev server (project root):

```powershell
npm run dev
```

- Common issues
  - Connection refused (net::ERR_CONNECTION_REFUSED)
    - Cause: backend not running or listening on a different port.
    - Fix: ensure backend is started and listening on the port shown in `server/index.js` (default 3002). Use:

```powershell
netstat -ano | findstr :3002
# if needed, kill a stuck process
# Stop-Process -Id <PID> -Force
```

  - 401 Unauthorized when placing an order
    - Cause: the backend requires a valid JWT in the Authorization header.
    - Fix: Sign in via the app (or register then sign in). Confirm the token exists in DevTools > Application > Local Storage under `auth_token`.
    - The frontend attaches the token automatically. If you still get 401, check the backend logs for token verification details.

  - React Router future flag warning
    - This is informational. It notifies you about upcoming behavior in v7 such as startTransition wrapping and relative splat changes.
    - You can opt into the flags when creating the router, or ignore the warning until you upgrade to v7.

- Helpful commands

```powershell
# Test API endpoint directly (backend must be running)
Invoke-WebRequest -Uri "http://localhost:3002/api/products" -UseBasicParsing -TimeoutSec 5

# Check node processes
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Select-Object ProcessId, CommandLine
```

If you hit a specific error (eg. `Token is invalid` or `User already exists`), paste the backend server logs in an issue or a PR comment and include the steps to reproduce — I can help pinpoint and fix it quickly.
