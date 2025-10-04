output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecr_server_repository_url" {
  description = "ECR repository URL for server"
  value       = aws_ecr_repository.server.repository_url
}

output "ecr_client_repository_url" {
  description = "ECR repository URL for client"
  value       = aws_ecr_repository.client.repository_url
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "next_steps" {
  description = "Next steps after deployment"
  value = <<-EOT
    
    🎉 EKS Cluster Created!
    
    Configure kubectl:
    aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}
    
    Build and push images:
    aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.server.repository_url}
    docker build -t ${aws_ecr_repository.server.repository_url}:latest -f Dockerfile.server .
    docker push ${aws_ecr_repository.server.repository_url}:latest
    docker build -t ${aws_ecr_repository.client.repository_url}:latest -f Dockerfile.client .
    docker push ${aws_ecr_repository.client.repository_url}:latest
    
    Deploy application:
    kubectl apply -f k8s/
    
    To destroy:
    terraform destroy
  EOT
}
