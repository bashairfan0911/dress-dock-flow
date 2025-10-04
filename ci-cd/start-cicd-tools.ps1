# Start CI/CD Tools Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting CI/CD Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Start CI/CD tools
Write-Host "Starting CI/CD tools with Docker Compose..." -ForegroundColor Yellow
Set-Location ci-cd
docker-compose -f docker-compose-cicd.yml up -d

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CI/CD Tools Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check SonarQube
Write-Host "SonarQube:    " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:9000" -ForegroundColor White
Write-Host "              Username: admin" -ForegroundColor Gray
Write-Host "              Password: admin (change on first login)" -ForegroundColor Gray
Write-Host ""

# Check Jenkins
Write-Host "Jenkins:      " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:8081" -ForegroundColor White
Write-Host "              Get initial password:" -ForegroundColor Gray
Write-Host "              docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Commands" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs:" -ForegroundColor White
Write-Host "  docker-compose -f ci-cd/docker-compose-cicd.yml logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Stop services:" -ForegroundColor White
Write-Host "  docker-compose -f ci-cd/docker-compose-cicd.yml down" -ForegroundColor Gray
Write-Host ""
Write-Host "Restart services:" -ForegroundColor White
Write-Host "  docker-compose -f ci-cd/docker-compose-cicd.yml restart" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Access SonarQube at http://localhost:9000" -ForegroundColor White
Write-Host "2. Login and change password" -ForegroundColor White
Write-Host "3. Create a token for Jenkins" -ForegroundColor White
Write-Host "4. Access Jenkins at http://localhost:8081" -ForegroundColor White
Write-Host "5. Complete Jenkins setup wizard" -ForegroundColor White
Write-Host "6. Install required plugins" -ForegroundColor White
Write-Host "7. Configure credentials" -ForegroundColor White
Write-Host "8. Create pipeline job" -ForegroundColor White
Write-Host ""

Write-Host "✅ CI/CD tools are starting!" -ForegroundColor Green
Write-Host "Please wait a few minutes for all services to be fully ready." -ForegroundColor Yellow
Write-Host ""

Set-Location ..
