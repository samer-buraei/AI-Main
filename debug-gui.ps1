Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  GUI Debugger & Fixer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Force Restart VcXsrv with correct settings
$vcxsrv = Get-Process -Name vcxsrv -ErrorAction SilentlyContinue
if ($vcxsrv) {
    Write-Host "⚠️  Killing existing VcXsrv instances..." -ForegroundColor Yellow
    Stop-Process -Name vcxsrv -Force
}

$paths = @(
    "C:\Program Files\VcXsrv\vcxsrv.exe",
    "C:\Program Files (x86)\VcXsrv\vcxsrv.exe"
)

$exe = $null
foreach ($p in $paths) {
    if (Test-Path $p) { $exe = $p; break }
}

if ($exe) {
    Write-Host "🚀 Restarting VcXsrv with CORRECT settings (-ac)..." -ForegroundColor Green
    # -ac (Disable Access Control) is the magic flag
    Start-Process $exe -ArgumentList ":0 -ac -multiwindow -clipboard -wgl"
    Start-Sleep -Seconds 2
} else {
    Write-Host "❌ VcXsrv executable not found." -ForegroundColor Red
    Write-Host "   Please start it manually and ensure 'Disable access control' is CHECKED." -ForegroundColor Yellow
}

# 2. Determine IP
$IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\.254" } | Select-Object -First 1).IPAddress
$env:DISPLAY = "$($IP):0.0"
Write-Host "`n🎯 Target DISPLAY: $env:DISPLAY" -ForegroundColor Cyan

# 3. Test Connection
Write-Host "🧪 Testing X11 connection (Launching xeyes)..." -ForegroundColor Gray
Write-Host "   (Close the eyes window to continue)" -ForegroundColor Gray

# Use the image we already built (fireswarm_sitl) since it has X libraries, or ubuntu
# We'll use ubuntu:22.04 and install x11-apps quickly
docker run --rm -e DISPLAY=$env:DISPLAY ubuntu:22.04 bash -c "apt-get update -qq && apt-get install -y x11-apps -qq >/dev/null && xeyes"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! X11 is working." -ForegroundColor Green
    Write-Host "   You can now run: .\start-simulation.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ FAILURE. Could not open GUI." -ForegroundColor Red
    Write-Host "   Firewall might be blocking VcXsrv." -ForegroundColor Yellow
}
