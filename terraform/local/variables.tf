variable "cluster_name" {
  description = "Name of the Kind cluster"
  type        = string
  default     = "dress-dock-cluster"
}

variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "default"
}

variable "mongodb_root_password" {
  description = "MongoDB root password"
  type        = string
  default     = "rootpassword123"
  sensitive   = true
}

variable "mongodb_password" {
  description = "MongoDB application password"
  type        = string
  default     = "password123"
  sensitive   = true
}

variable "server_replicas" {
  description = "Number of server replicas"
  type        = number
  default     = 2
}

variable "client_replicas" {
  description = "Number of client replicas"
  type        = number
  default     = 2
}
