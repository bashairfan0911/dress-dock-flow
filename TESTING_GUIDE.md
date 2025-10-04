# Testing Guide - Dress Dock Flow

## 🧪 Complete Testing Documentation

This guide provides comprehensive testing instructions for the Dress Dock Flow application.

## 📋 Table of Contents

- [Quick Test](#quick-test)
- [Deployment Testing](#deployment-testing)
- [API Testing](#api-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Test

### Prerequisites Check

```powershell
# Check Docker
docker --version

# Check kubectl
kubectl version --client

# Check kind
kind version

# Check Helm
helm version
```

### One-Command Deploy & Test

```powershell
# Deploy everything
kind create cluster --config kind-config.yaml
docker build -t dress-dock-server:latest -f Dockerfile.server .
docker build -t dress-dock-client:latest -f Dockerfile.client .
kind load docker-image dress-dock-server:latest --name dress-dock-cluster
kind load docker-image dress-dock-client:latest --name dress-dock-cluster
kubectl apply -f k8s/
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
kubectl apply -f k8s/ingress.yaml

# Seed database
Start-Sleep -Seconds 30
$podName = (kubectl get pods -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')
kubectl exec $podName -- node seed.js

# Test
curl http://localhost/api/health
curl http://localhost/api/products
```

## 📊 Deployment Testing

### Test 1: Cluster Health

```powershell
# Check cluster
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://127.0.0.1:xxxxx
# CoreDNS is running at https://127.0.0.1:xxxxx/...
```

**✅ Pass Criteria:** Control plane and CoreDNS running

### Test 2: Node Status

```powershell
# Check nodes
kubectl get nodes

# Expected output:
# NAME                               STATUS   ROLES           AGE   VERSION
# dress-dock-cluster-control-plane   Ready    control-plane   Xm    v1.34.0
```

**✅ Pass Criteria:** All nodes in Ready status

### Test 3: Pod Deployment

```powershell
# Check all pods
kubectl get pods

# Expected output:
# NAME                                 READY   STATUS    RESTARTS   AGE
# dress-dock-client-xxx-xxx            1/1     Running   0          Xm
# dress-dock-client-xxx-xxx            1/1     Running   0          Xm
# dress-dock-server-xxx-xxx            1/1     Running   0          Xm
# dress-dock-server-xxx-xxx            1/1     Running   0          Xm
# mongodb-xxx-xxx                      1/1     Running   0          Xm
```

**✅ Pass Criteria:** 
- 2 client pods running
- 2 server pods running
- 1 MongoDB pod running
- All pods in Running status

### Test 4: Service Discovery

```powershell
# Check services
kubectl get svc

# Expected output:
# NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# dress-dock-client   ClusterIP   10.96.xxx.xxx   <none>        80/TCP
# dress-dock-server   ClusterIP   10.96.xxx.xxx   <none>        5000/TCP
# mongodb             ClusterIP   10.96.xxx.xxx   <none>        27017/TCP
```

**✅ Pass Criteria:** All services created with correct ports

### Test 5: Ingress Configuration

```powershell
# Check ingress
kubectl get ingress

# Expected output:
# NAME                 CLASS   HOSTS   ADDRESS     PORTS   AGE
# dress-dock-ingress   nginx   *       localhost   80      Xm
```

**✅ Pass Criteria:** Ingress created with nginx class

## 🔌 API Testing

### Test 1: Health Endpoint

```powershell
# Test health
curl http://localhost/api/health -UseBasicParsing

# Expected output:
# StatusCode: 200
# Content: {"status":"ok"}
```

**✅ Pass Criteria:** Status 200, response contains "ok"

### Test 2: Products Endpoint

```powershell
# Test products
$response = curl http://localhost/api/products -UseBasicParsing
$products = $response.Content | ConvertFrom-Json
Write-Host "Total Products: $($products.Count)"
$products | Select-Object name, category, price | Format-Table

# Expected output:
# Total Products: 20
# Table with 20 products (10 men's, 10 women's)
```

**✅ Pass Criteria:** 
- Status 200
- 20 products returned
- Products have name, category, price fields

### Test 3: Authentication - Register

```powershell
# Register new user
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$response = curl http://localhost/api/auth/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
Write-Host "User ID: $($result.user._id)"
Write-Host "Token: $($result.token.Substring(0,20))..."

# Expected output:
# StatusCode: 201
# User object with _id, email, name
# JWT token
```

**✅ Pass Criteria:** 
- Status 201
- User object returned
- Token generated

### Test 4: Authentication - Login

```powershell
# Login
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = curl http://localhost/api/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
$token = $result.token
Write-Host "Login successful! Token: $($token.Substring(0,20))..."

# Expected output:
# StatusCode: 200
# User object and token
```

**✅ Pass Criteria:** 
- Status 200
- Valid token returned

### Test 5: Protected Endpoint - Create Order

```powershell
# Create order (requires authentication)
$orderBody = @{
    products = @(
        @{
            productId = "68e0ad24941affe2ec19c8c8"  # Use actual product ID
            quantity = 2
        }
    )
} | ConvertTo-Json

$response = curl http://localhost/api/orders `
    -Method POST `
    -Body $orderBody `
    -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} `
    -UseBasicParsing

$order = $response.Content | ConvertFrom-Json
Write-Host "Order ID: $($order._id)"
Write-Host "Total: $($order.total)"

# Expected output:
# StatusCode: 201
# Order object with _id, total, status
```

**✅ Pass Criteria:** 
- Status 201
- Order created with correct total

## 🌐 Frontend Testing

### Test 1: Homepage Load

```powershell
# Test homepage
$response = curl http://localhost/ -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
Write-Host "Content Length: $($response.Content.Length) bytes"

# Expected output:
# Status: 200
# Content-Type: text/html
# Content Length: > 0
```

**✅ Pass Criteria:** 
- Status 200
- HTML content returned

### Test 2: Static Assets

```powershell
# Test if assets are loading
$response = curl http://localhost/assets/ -UseBasicParsing
Write-Host "Assets Status: $($response.StatusCode)"

# Expected output:
# Status: 200 or 403 (directory listing disabled)
```

**✅ Pass Criteria:** Server responds (not 404)

### Test 3: API Routes from Frontend

```powershell
# Test API routing through ingress
curl http://localhost/api/products -UseBasicParsing | Select-Object StatusCode
curl http://localhost/api/health -UseBasicParsing | Select-Object StatusCode

# Expected output:
# StatusCode: 200 for both
```

**✅ Pass Criteria:** Both endpoints return 200

## 🔗 Integration Testing

### Test 1: End-to-End User Flow

```powershell
Write-Host "🧪 Running E2E Test..." -ForegroundColor Cyan

# 1. Register user
$registerBody = @{
    email = "e2e@test.com"
    password = "test123"
    name = "E2E Test"
} | ConvertTo-Json

$registerResponse = curl http://localhost/api/auth/register `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json" `
    -UseBasicParsing

$user = ($registerResponse.Content | ConvertFrom-Json)
$token = $user.token
Write-Host "✅ User registered: $($user.user.email)"

# 2. Get products
$products = (curl http://localhost/api/products -UseBasicParsing).Content | ConvertFrom-Json
Write-Host "✅ Products loaded: $($products.Count) items"

# 3. Create order
$orderBody = @{
    products = @(
        @{
            productId = $products[0]._id
            quantity = 1
        }
    )
} | ConvertTo-Json

$orderResponse = curl http://localhost/api/orders `
    -Method POST `
    -Body $orderBody `
    -ContentType "application/json" `
    -Headers @{Authorization="Bearer $token"} `
    -UseBasicParsing

$order = ($orderResponse.Content | ConvertFrom-Json)
Write-Host "✅ Order created: $($order._id)"
Write-Host "✅ Order total: `$$($order.total)"

Write-Host "`n🎉 E2E Test Passed!" -ForegroundColor Green
```

**✅ Pass Criteria:** All steps complete successfully

### Test 2: Database Persistence

```powershell
# Create data
$body = @{
    email = "persist@test.com"
    password = "test123"
    name = "Persist Test"
} | ConvertTo-Json

curl http://localhost/api/auth/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

# Restart server pods
kubectl rollout restart deployment dress-dock-server
Start-Sleep -Seconds 30

# Try to login (data should persist)
$loginBody = @{
    email = "persist@test.com"
    password = "test123"
} | ConvertTo-Json

$response = curl http://localhost/api/auth/login `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Login Status: $($response.StatusCode)"

# Expected output:
# Login Status: 200
```

**✅ Pass Criteria:** Login succeeds after pod restart

## ⚡ Performance Testing

### Test 1: Response Time

```powershell
# Measure API response time
$iterations = 10
$times = @()

for ($i = 1; $i -le $iterations; $i++) {
    $start = Get-Date
    curl http://localhost/api/products -UseBasicParsing | Out-Null
    $end = Get-Date
    $duration = ($end - $start).TotalMilliseconds
    $times += $duration
    Write-Host "Request $i : $duration ms"
}

$avg = ($times | Measure-Object -Average).Average
Write-Host "`nAverage Response Time: $avg ms" -ForegroundColor Cyan

# Expected output:
# Average < 500ms
```

**✅ Pass Criteria:** Average response time < 500ms

### Test 2: Concurrent Requests

```powershell
# Test concurrent load
$jobs = @()
$count = 20

Write-Host "Sending $count concurrent requests..."

for ($i = 1; $i -le $count; $i++) {
    $jobs += Start-Job -ScriptBlock {
        curl http://localhost/api/products -UseBasicParsing
    }
}

$results = $jobs | Wait-Job | Receive-Job
$successful = ($results | Where-Object { $_.StatusCode -eq 200 }).Count

Write-Host "Successful: $successful / $count"

$jobs | Remove-Job

# Expected output:
# Successful: 20 / 20
```

**✅ Pass Criteria:** All requests succeed

### Test 3: Resource Usage

```powershell
# Check resource usage
kubectl top nodes
kubectl top pods

# Expected output:
# CPU and Memory usage within limits
```

**✅ Pass Criteria:** 
- CPU < 80%
- Memory < 80%

## 🔒 Security Testing

### Test 1: Authentication Required

```powershell
# Try to create order without token
$orderBody = @{
    products = @(@{productId = "test"; quantity = 1})
} | ConvertTo-Json

$response = curl http://localhost/api/orders `
    -Method POST `
    -Body $orderBody `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"

# Expected output:
# Status: 401 (Unauthorized)
```

**✅ Pass Criteria:** Returns 401 without authentication

### Test 2: Invalid Token

```powershell
# Try with invalid token
$response = curl http://localhost/api/orders `
    -Method POST `
    -Headers @{Authorization="Bearer invalid_token"} `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"

# Expected output:
# Status: 401 (Unauthorized)
```

**✅ Pass Criteria:** Returns 401 with invalid token

### Test 3: SQL Injection Protection

```powershell
# Try SQL injection in login
$body = @{
    email = "admin' OR '1'='1"
    password = "password"
} | ConvertTo-Json

$response = curl http://localhost/api/auth/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"

# Expected output:
# Status: 401 (Unauthorized)
```

**✅ Pass Criteria:** Attack fails, returns 401

## 🛠️ Troubleshooting

### Issue: Pods Not Starting

```powershell
# Check pod status
kubectl get pods

# Describe problematic pod
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common fixes:
# 1. Rebuild and reload images
docker build -t dress-dock-server:latest -f Dockerfile.server .
kind load docker-image dress-dock-server:latest --name dress-dock-cluster
kubectl rollout restart deployment dress-dock-server

# 2. Check resource limits
kubectl describe node
```

### Issue: Cannot Access Application

```powershell
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress
kubectl get ingress

# Port-forward directly to service
kubectl port-forward svc/dress-dock-client 8080:80

# Then test: http://localhost:8080
```

### Issue: Database Connection Failed

```powershell
# Check MongoDB pod
kubectl get pods -l app=mongodb

# Check MongoDB logs
kubectl logs -l app=mongodb

# Test connection from server pod
$podName = (kubectl get pods -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $podName -- sh
# Inside pod: nc -zv mongodb 27017
```

### Issue: 404 Errors

```powershell
# Check if ingress is configured
kubectl describe ingress dress-dock-ingress

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Verify services
kubectl get svc
```

## 📊 Test Results Summary

### Deployment Tests
- [ ] Cluster health
- [ ] Node status
- [ ] Pod deployment
- [ ] Service discovery
- [ ] Ingress configuration

### API Tests
- [ ] Health endpoint
- [ ] Products endpoint
- [ ] Register user
- [ ] Login user
- [ ] Create order

### Frontend Tests
- [ ] Homepage load
- [ ] Static assets
- [ ] API routing

### Integration Tests
- [ ] End-to-end flow
- [ ] Database persistence

### Performance Tests
- [ ] Response time
- [ ] Concurrent requests
- [ ] Resource usage

### Security Tests
- [ ] Authentication required
- [ ] Invalid token
- [ ] SQL injection protection

## 🎯 Quick Test Script

Save this as `test-all.ps1`:

```powershell
# Complete Test Suite
Write-Host "🧪 Running Complete Test Suite..." -ForegroundColor Cyan

# 1. Deployment Tests
Write-Host "`n1️⃣ Deployment Tests" -ForegroundColor Yellow
kubectl cluster-info | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "✅ Cluster healthy" -ForegroundColor Green } else { Write-Host "❌ Cluster failed" -ForegroundColor Red }

$pods = kubectl get pods --no-headers
$runningPods = ($pods | Select-String "Running").Count
Write-Host "✅ $runningPods pods running" -ForegroundColor Green

# 2. API Tests
Write-Host "`n2️⃣ API Tests" -ForegroundColor Yellow
$health = curl http://localhost/api/health -UseBasicParsing
if ($health.StatusCode -eq 200) { Write-Host "✅ Health endpoint OK" -ForegroundColor Green } else { Write-Host "❌ Health endpoint failed" -ForegroundColor Red }

$products = curl http://localhost/api/products -UseBasicParsing
$productCount = (($products.Content | ConvertFrom-Json).Count)
Write-Host "✅ Products endpoint OK ($productCount products)" -ForegroundColor Green

# 3. Frontend Tests
Write-Host "`n3️⃣ Frontend Tests" -ForegroundColor Yellow
$frontend = curl http://localhost/ -UseBasicParsing
if ($frontend.StatusCode -eq 200) { Write-Host "✅ Frontend OK" -ForegroundColor Green } else { Write-Host "❌ Frontend failed" -ForegroundColor Red }

Write-Host "`n🎉 Test Suite Complete!" -ForegroundColor Cyan
```

Run with:
```powershell
.\test-all.ps1
```

## 📚 Additional Resources

- **Deployment Guide**: [deployment/LOCAL_KIND_DEPLOYMENT.md](deployment/LOCAL_KIND_DEPLOYMENT.md)
- **AWS Guide**: [deployment/AWS_EKS_DEPLOYMENT.md](deployment/AWS_EKS_DEPLOYMENT.md)
- **CI/CD Guide**: [ci-cd/CICD_SETUP_GUIDE.md](ci-cd/CICD_SETUP_GUIDE.md)
- **Monitoring Guide**: [monitoring/MONITORING_GUIDE.md](monitoring/MONITORING_GUIDE.md)

---

**Happy Testing! 🧪✨**
