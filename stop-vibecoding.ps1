# Vibecoding Project Manager - Stop All Services
# Run with: .\stop-vibecoding.ps1

Write-Host "========================================" -ForegroundColor Red
Write-Host "  Stopping All Vibecoding Services" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Get all Node.js processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "[INFO] Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    Write-Host "[INFO] Stopping all Node.js processes..." -ForegroundColor Yellow
    
    $nodeProcesses | Stop-Process -Force
    
    Write-Host "[OK] All services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "[INFO] No running services found (or already stopped)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All Vibecoding services have been stopped." -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"

