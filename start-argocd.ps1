# ArgoCD Quick Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ArgoCD Setup for Dress Dock Flow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ArgoCD is running
Write-Host "Checking ArgoCD status..." -ForegroundColor Yellow
$pods = kubectl get pods -n argocd --no-headers 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ArgoCD is not installed!" -ForegroundColor Red
    Write-Host "Please run the installation first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ ArgoCD is running!" -ForegroundColor Green
Write-Host ""

# Display credentials
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Login Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Username: " -NoNewline -ForegroundColor Yellow
Write-Host "admin" -ForegroundColor White
Write-Host "Password: " -NoNewline -ForegroundColor Yellow
Write-Host "mkJ8rO37spdaB8ru" -ForegroundColor White
Write-Host ""

# Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Starting port-forward in the background..." -ForegroundColor Yellow
Write-Host "   (This will run in a new window)" -ForegroundColor Gray
Write-Host ""

# Start port-forward in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward svc/argocd-server -n argocd 8080:443"

Start-Sleep -Seconds 3

Write-Host "2. Opening ArgoCD UI in your browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "https://localhost:8080"

Write-Host ""
Write-Host "✅ ArgoCD UI should open in your browser!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login with the credentials above" -ForegroundColor White
Write-Host "2. Deploy your application:" -ForegroundColor White
Write-Host "   kubectl apply -f k8s/argocd/application.yaml" -ForegroundColor Gray
Write-Host ""
Write-Host "3. View your application in ArgoCD UI" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
