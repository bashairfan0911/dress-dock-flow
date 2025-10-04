# Access Monitoring Stack Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Monitoring Stack Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get Grafana password
Write-Host "Getting Grafana credentials..." -ForegroundColor Yellow
$grafanaPassword = kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}"
$decodedPassword = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($grafanaPassword))

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Grafana Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Username: " -NoNewline -ForegroundColor Yellow
Write-Host "admin" -ForegroundColor White
Write-Host "Password: " -NoNewline -ForegroundColor Yellow
Write-Host $decodedPassword -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Port Forwards" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Grafana port-forward
Write-Host "1. Starting Grafana on http://localhost:3000" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
Start-Sleep -Seconds 2

# Start Prometheus port-forward
Write-Host "2. Starting Prometheus on http://localhost:9090" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"
Start-Sleep -Seconds 2

# Start Alertmanager port-forward
Write-Host "3. Starting Alertmanager on http://localhost:9093" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Grafana:      " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor White
Write-Host "Prometheus:   " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:9090" -ForegroundColor White
Write-Host "Alertmanager: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:9093" -ForegroundColor White
Write-Host ""

Write-Host "Opening Grafana in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Start Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login to Grafana with credentials above" -ForegroundColor White
Write-Host "2. Go to Dashboards > Browse" -ForegroundColor White
Write-Host "3. Pre-configured dashboards:" -ForegroundColor White
Write-Host "   - Kubernetes Cluster Monitoring" -ForegroundColor Gray
Write-Host "   - Node Exporter Full" -ForegroundColor Gray
Write-Host "   - MongoDB Dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create custom dashboards for your app" -ForegroundColor White
Write-Host "5. Set up alerts in Alertmanager" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
