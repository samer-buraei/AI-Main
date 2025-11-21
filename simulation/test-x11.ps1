# Test X11 Connection Script
Write-Host "Testing X11 connection to Docker container..." -ForegroundColor Cyan

Write-Host "`n1. Checking if DISPLAY is set..." -ForegroundColor Yellow
if ($env:DISPLAY) {
    Write-Host "✅ DISPLAY = $env:DISPLAY" -ForegroundColor Green
} else {
    Write-Host "❌ DISPLAY not set" -ForegroundColor Red
}

Write-Host "`n2. Checking for X Server processes..." -ForegroundColor Yellow
$xserver = Get-Process | Where-Object { $_.ProcessName -like "*vcxsrv*" -or $_.ProcessName -like "*xming*" -or $_.ProcessName -like "*x410*" } | Select-Object -First 1
if ($xserver) {
    Write-Host "✅ Found X Server: $($xserver.ProcessName) (PID: $($xserver.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ No X Server found running" -ForegroundColor Red
    Write-Host "   Please start VcXsrv, XMing, or X410" -ForegroundColor White
}

Write-Host "`n3. Testing basic X11 connection..." -ForegroundColor Yellow
try {
    $result = docker run --rm -e DISPLAY=$env:DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix --entrypoint xeyes ubuntu:20.04 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ X11 connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ X11 connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ X11 test failed: $_" -ForegroundColor Red
}

Write-Host "`n📋 SETUP INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Download and install VcXsrv: https://sourceforge.net/projects/vcxsrv/" -ForegroundColor White
Write-Host "2. Start VcXsrv with these settings:" -ForegroundColor White
Write-Host "   - Multiple windows" -ForegroundColor Gray
Write-Host "   - Display number: -1 (auto)" -ForegroundColor Gray
Write-Host "   - Start no client" -ForegroundColor Gray
Write-Host "   - Disable access control (IMPORTANT!)" -ForegroundColor Yellow
Write-Host "3. Run: .\start-simulation.ps1" -ForegroundColor White

Read-Host "`nPress Enter to exit"
