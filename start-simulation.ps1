Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FireSwarm Simulation Launcher" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Navigate to simulation directory
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir/simulation"

# Check if image exists
$ImageExists = $false
try {
    $imageInfo = docker images fireswarm_sitl:latest --format "{{.Repository}}:{{.Tag}}" 2>$null
    $ImageExists = $imageInfo -match "fireswarm_sitl:latest"
} catch {
    # Ignore errors
}

# Auto-detect DISPLAY for X11
if (-not $env:DISPLAY) {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\.254"
    } | Select-Object -First 1).IPAddress

    if ($IP) {
        $env:DISPLAY = "$($IP):0.0"
        Write-Host "[INFO] Auto-detected DISPLAY: $env:DISPLAY" -ForegroundColor Gray
    } else {
        Write-Host "[WARN] Could not auto-detect IP. GUI might not work." -ForegroundColor Red
    }
}

Write-Host "`n[IMPORTANT]" -ForegroundColor Yellow
Write-Host "1. Ensure an X Server (like VcXsrv) is running on Windows." -ForegroundColor Yellow
Write-Host "2. Ensure 'Disable access control' is checked in X Server settings.`n" -ForegroundColor Yellow

# Run the simulation
if ($ImageExists) {
    Write-Host "[INFO] Image exists. Starting simulation..." -ForegroundColor Green
    docker-compose up
} else {
    Write-Host "[INFO] Building image and starting simulation..." -ForegroundColor Yellow
    docker-compose up --build
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Simulation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Simulation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

Read-Host "Press Enter to exit..."

