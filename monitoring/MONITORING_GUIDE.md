# Monitoring Guide - Dress Dock Flow

## ✅ Monitoring Stack Installed!

Your Kubernetes cluster now has a complete monitoring solution with Prometheus, Grafana, and Alertmanager.

## 🎯 Quick Start

### Access Monitoring Tools

Run the access script:
```powershell
.\monitoring\access-monitoring.ps1
```

Or manually:
```powershell
# Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Alertmanager
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
```

### Access URLs

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

### Grafana Credentials

**Username**: `admin`  
**Password**: Get it with:
```powershell
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

Or it's set to: `admin123` (from values file)

## 📊 What's Being Monitored

### 1. **Kubernetes Cluster Metrics**
- Node CPU, Memory, Disk usage
- Pod resource consumption
- Container metrics
- Network traffic

### 2. **Application Metrics**
- Dress Dock Server (Node.js)
- Dress Dock Client (Nginx)
- MongoDB database
- Request rates and latencies

### 3. **System Metrics**
- Operating system metrics
- Hardware utilization
- Disk I/O
- Network I/O

## 🎨 Pre-configured Dashboards

### Kubernetes Cluster Monitoring (ID: 7249)
- Overall cluster health
- Node resource usage
- Pod status and distribution
- Namespace resource consumption

### Node Exporter Full (ID: 1860)
- Detailed node metrics
- CPU, Memory, Disk, Network
- System load and processes
- Hardware temperature (if available)

### MongoDB Dashboard (ID: 2583)
- Database operations
- Connection pool
- Query performance
- Replication status

## 🔧 Components Installed

### Prometheus
- **Purpose**: Metrics collection and storage
- **Retention**: 7 days
- **Storage**: 5Gi persistent volume
- **Port**: 9090

### Grafana
- **Purpose**: Visualization and dashboards
- **Storage**: 2Gi persistent volume
- **Port**: 3000 (NodePort: 30080)

### Alertmanager
- **Purpose**: Alert routing and management
- **Port**: 9093

### Node Exporter
- **Purpose**: Hardware and OS metrics
- **Runs on**: Every node

### Kube State Metrics
- **Purpose**: Kubernetes object metrics
- **Monitors**: Deployments, Pods, Services, etc.

## 📈 Creating Custom Dashboards

### 1. Login to Grafana
```
URL: http://localhost:3000
Username: admin
Password: admin123
```

### 2. Create New Dashboard
1. Click **+** icon → **Dashboard**
2. Click **Add visualization**
3. Select **Prometheus** as data source
4. Write PromQL query

### 3. Example Queries

**CPU Usage by Pod:**
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="default"}[5m])) by (pod)
```

**Memory Usage by Pod:**
```promql
sum(container_memory_usage_bytes{namespace="default"}) by (pod)
```

**HTTP Request Rate:**
```promql
rate(http_requests_total[5m])
```

**Pod Restart Count:**
```promql
kube_pod_container_status_restarts_total{namespace="default"}
```

## 🚨 Setting Up Alerts

### 1. Create Alert Rule in Grafana

1. Go to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. Define conditions (e.g., CPU > 80%)
4. Set notification channel

### 2. Example Alert Rules

**High CPU Usage:**
```yaml
- alert: HighCPUUsage
  expr: sum(rate(container_cpu_usage_seconds_total[5m])) by (pod) > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage detected"
    description: "Pod {{ $labels.pod }} CPU usage is above 80%"
```

**Pod Down:**
```yaml
- alert: PodDown
  expr: kube_pod_status_phase{phase="Running"} == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Pod is down"
    description: "Pod {{ $labels.pod }} is not running"
```

## 📊 Monitoring Your Application

### Add Metrics to Your Node.js Server

Install Prometheus client:
```bash
npm install prom-client
```

Add to `server/index.js`:
```javascript
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## 🔍 Useful Commands

### Check Monitoring Stack Status
```powershell
kubectl get pods -n monitoring
kubectl get svc -n monitoring
kubectl get pvc -n monitoring
```

### View Prometheus Targets
```powershell
# Port-forward Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Open http://localhost:9090/targets
```

### Check Grafana Logs
```powershell
kubectl logs -n monitoring deployment/prometheus-grafana
```

### Restart Monitoring Components
```powershell
kubectl rollout restart -n monitoring deployment/prometheus-grafana
kubectl rollout restart -n monitoring statefulset/prometheus-prometheus-kube-prometheus-prometheus
```

## 📦 Helm Chart Management

### List Installed Charts
```powershell
helm list -n monitoring
```

### Upgrade Monitoring Stack
```powershell
helm upgrade prometheus prometheus-community/kube-prometheus-stack -n monitoring -f monitoring/prometheus-values.yaml
```

### Uninstall Monitoring Stack
```powershell
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring
```

### View Chart Values
```powershell
helm get values prometheus -n monitoring
```

## 🎯 Key Metrics to Monitor

### Application Health
- ✅ Pod status and restarts
- ✅ Container resource usage
- ✅ Request rate and latency
- ✅ Error rates

### Database
- ✅ MongoDB connections
- ✅ Query performance
- ✅ Disk usage
- ✅ Replication lag

### Infrastructure
- ✅ Node CPU and memory
- ✅ Disk I/O
- ✅ Network bandwidth
- ✅ Pod scheduling

## 🔧 Troubleshooting

### Grafana Not Accessible
```powershell
# Check pod status
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

# Check logs
kubectl logs -n monitoring -l app.kubernetes.io/name=grafana

# Restart
kubectl rollout restart -n monitoring deployment/prometheus-grafana
```

### Prometheus Not Scraping Metrics
```powershell
# Check Prometheus logs
kubectl logs -n monitoring prometheus-prometheus-kube-prometheus-prometheus-0

# Check targets in Prometheus UI
# http://localhost:9090/targets
```

### High Resource Usage
```powershell
# Reduce retention period in values file
# Reduce scrape interval
# Limit number of metrics collected
```

## 📚 Resources

- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **PromQL Guide**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Dashboards**: https://grafana.com/grafana/dashboards/

## 🎉 Next Steps

1. ✅ Access Grafana at http://localhost:3000
2. ✅ Explore pre-configured dashboards
3. ✅ Create custom dashboards for your app
4. ✅ Set up alerts for critical metrics
5. ✅ Add custom metrics to your application
6. ✅ Configure notification channels (email, Slack, etc.)

---

**Your monitoring stack is ready! Run `.\monitoring\access-monitoring.ps1` to get started!** 📊✨
