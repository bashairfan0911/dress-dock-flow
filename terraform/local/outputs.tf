output "cluster_name" {
  description = "Name of the Kind cluster"
  value       = kind_cluster.default.name
}

output "kubeconfig_path" {
  description = "Path to kubeconfig file"
  value       = kind_cluster.default.kubeconfig_path
}

output "cluster_endpoint" {
  description = "Cluster endpoint"
  value       = kind_cluster.default.endpoint
}

output "application_url" {
  description = "Application URL"
  value       = "http://localhost"
}

output "api_url" {
  description = "API URL"
  value       = "http://localhost/api"
}

output "namespace" {
  description = "Application namespace"
  value       = var.namespace
}

output "next_steps" {
  description = "Next steps after deployment"
  value = <<-EOT
    
    🎉 Deployment Complete!
    
    Access your application:
    - Frontend: http://localhost/
    - API: http://localhost/api/products
    - Health: http://localhost/api/health
    
    Useful commands:
    - kubectl get pods -n ${var.namespace}
    - kubectl logs -f -l app=dress-dock-server -n ${var.namespace}
    - kubectl port-forward svc/dress-dock-server-service 5000:5000 -n ${var.namespace}
    
    To destroy:
    - terraform destroy
  EOT
}
