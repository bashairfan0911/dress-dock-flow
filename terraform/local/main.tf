terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

provider "kind" {}

provider "kubernetes" {
  config_path = pathexpand("~/.kube/config")
  config_context = "kind-${var.cluster_name}"
}

provider "helm" {
  kubernetes {
    config_path = pathexpand("~/.kube/config")
    config_context = "kind-${var.cluster_name}"
  }
}

# Create Kind cluster
resource "kind_cluster" "default" {
  name = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      kubeadm_config_patches = [
        "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
      ]

      extra_port_mappings {
        container_port = 80
        host_port      = 80
      }
      extra_port_mappings {
        container_port = 443
        host_port      = 443
      }
    }

    node {
      role = "worker"
    }

    node {
      role = "worker"
    }
  }
}

# Build and load Docker images
resource "null_resource" "build_images" {
  depends_on = [kind_cluster.default]

  provisioner "local-exec" {
    command = <<-EOT
      docker build -t dress-dock-server:latest -f ../../Dockerfile.server ../..
      docker build -t dress-dock-client:latest -f ../../Dockerfile.client ../..
      kind load docker-image dress-dock-server:latest --name ${var.cluster_name}
      kind load docker-image dress-dock-client:latest --name ${var.cluster_name}
    EOT
  }

  triggers = {
    always_run = timestamp()
  }
}

# Create namespace
resource "kubernetes_namespace" "app" {
  depends_on = [kind_cluster.default]

  metadata {
    name = var.namespace
  }
}

# MongoDB Secret
resource "kubernetes_secret" "mongodb" {
  depends_on = [kubernetes_namespace.app]

  metadata {
    name      = "mongodb-secret"
    namespace = var.namespace
  }

  data = {
    mongodb-root-password = base64encode(var.mongodb_root_password)
    mongodb-password      = base64encode(var.mongodb_password)
  }
}

# MongoDB Deployment
resource "kubernetes_deployment" "mongodb" {
  depends_on = [kubernetes_secret.mongodb]

  metadata {
    name      = "mongodb"
    namespace = var.namespace
    labels = {
      app = "mongodb"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "mongodb"
      }
    }

    template {
      metadata {
        labels = {
          app = "mongodb"
        }
      }

      spec {
        container {
          name  = "mongodb"
          image = "mongo:7.0"

          port {
            container_port = 27017
          }

          env {
            name = "MONGO_INITDB_ROOT_USERNAME"
            value = "admin"
          }

          env {
            name = "MONGO_INITDB_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = "mongodb-secret"
                key  = "mongodb-root-password"
              }
            }
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          volume_mount {
            name       = "mongodb-storage"
            mount_path = "/data/db"
          }
        }

        volume {
          name = "mongodb-storage"
          empty_dir {}
        }
      }
    }
  }
}

# MongoDB Service
resource "kubernetes_service" "mongodb" {
  depends_on = [kubernetes_deployment.mongodb]

  metadata {
    name      = "mongodb-service"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "mongodb"
    }

    port {
      port        = 27017
      target_port = 27017
    }

    type = "ClusterIP"
  }
}

# Server Deployment
resource "kubernetes_deployment" "server" {
  depends_on = [null_resource.build_images, kubernetes_service.mongodb]

  metadata {
    name      = "dress-dock-server"
    namespace = var.namespace
    labels = {
      app = "dress-dock-server"
    }
  }

  spec {
    replicas = var.server_replicas

    selector {
      match_labels = {
        app = "dress-dock-server"
      }
    }

    template {
      metadata {
        labels = {
          app = "dress-dock-server"
        }
      }

      spec {
        container {
          name  = "server"
          image = "dress-dock-server:latest"
          image_pull_policy = "Never"

          port {
            container_port = 5000
          }

          env {
            name  = "MONGODB_URI"
            value = "mongodb://admin:${var.mongodb_root_password}@mongodb-service:27017/dressshop?authSource=admin"
          }

          env {
            name  = "PORT"
            value = "5000"
          }

          env {
            name  = "NODE_ENV"
            value = "production"
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = 5000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/api/health"
              port = 5000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# Server Service
resource "kubernetes_service" "server" {
  depends_on = [kubernetes_deployment.server]

  metadata {
    name      = "dress-dock-server-service"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "dress-dock-server"
    }

    port {
      port        = 5000
      target_port = 5000
    }

    type = "ClusterIP"
  }
}

# Client Deployment
resource "kubernetes_deployment" "client" {
  depends_on = [null_resource.build_images]

  metadata {
    name      = "dress-dock-client"
    namespace = var.namespace
    labels = {
      app = "dress-dock-client"
    }
  }

  spec {
    replicas = var.client_replicas

    selector {
      match_labels = {
        app = "dress-dock-client"
      }
    }

    template {
      metadata {
        labels = {
          app = "dress-dock-client"
        }
      }

      spec {
        container {
          name  = "client"
          image = "dress-dock-client:latest"
          image_pull_policy = "Never"

          port {
            container_port = 80
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "256Mi"
              cpu    = "200m"
            }
          }
        }
      }
    }
  }
}

# Client Service
resource "kubernetes_service" "client" {
  depends_on = [kubernetes_deployment.client]

  metadata {
    name      = "dress-dock-client-service"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "dress-dock-client"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}

# Install NGINX Ingress Controller
resource "helm_release" "nginx_ingress" {
  depends_on = [kind_cluster.default]

  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.hostPort.enabled"
    value = "true"
  }

  set {
    name  = "controller.service.type"
    value = "NodePort"
  }
}

# Ingress Resource
resource "kubernetes_ingress_v1" "app" {
  depends_on = [
    helm_release.nginx_ingress,
    kubernetes_service.server,
    kubernetes_service.client
  ]

  metadata {
    name      = "dress-dock-ingress"
    namespace = var.namespace
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
    }
  }

  spec {
    rule {
      http {
        path {
          path      = "/api"
          path_type = "Prefix"

          backend {
            service {
              name = "dress-dock-server-service"
              port {
                number = 5000
              }
            }
          }
        }

        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = "dress-dock-client-service"
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}

# Seed database
resource "null_resource" "seed_database" {
  depends_on = [kubernetes_deployment.server]

  provisioner "local-exec" {
    command = <<-EOT
      sleep 30
      POD=$(kubectl get pods -n ${var.namespace} -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')
      kubectl exec -n ${var.namespace} $POD -- node seed.js || true
    EOT
  }
}
