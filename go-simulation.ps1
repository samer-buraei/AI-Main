# ============================================================
#  FireSwarm Simulation - Complete Startup Script
#  "go-simulation.ps1" - One script to start it all!
# ============================================================

param(
    [switch]$Restart,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Build,
    [switch]$Help
)

$ErrorActionPreference = "Continue"

# Colors for output
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

# Show help
if ($Help) {
    Write-Info "=================================================="
    Write-Info "  FireSwarm Simulation - Usage"
    Write-Info "=================================================="
    Write-Host ""
    Write-Host "Usage: .\go-simulation.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  (no options)    Start simulation (auto-restart if needed)"
    Write-Host "  -Restart        Force restart (stop existing, then start)"
    Write-Host "  -Stop           Stop running simulation"
    Write-Host "  -Status         Check current status"
    Write-Host "  -Build          Force rebuild Docker image"
    Write-Host "  -Help           Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\go-simulation.ps1           # Start simulation"
    Write-Host "  .\go-simulation.ps1 -Restart # Restart simulation"
    Write-Host "  .\go-simulation.ps1 -Status   # Check status"
    Write-Host "  .\go-simulation.ps1 -Stop    # Stop simulation"
    Write-Host ""
    exit 0
}

# Navigate to simulation directory
$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$SimulationDir = Join-Path $ScriptDir "simulation"
if (-not (Test-Path $SimulationDir)) {
    Write-Error "Error: simulation directory not found at: $SimulationDir"
    exit 1
}
Set-Location $SimulationDir

Write-Info "=================================================="
Write-Info "  FireSwarm Simulation Manager"
Write-Info "=================================================="
Write-Host ""

# ============================================================
# Status Check Function
# ============================================================
function Get-SimulationStatus {
    Write-Info "[STATUS] Checking simulation status..."
    
    # Check Docker
    $dockerRunning = $false
    try {
        $null = docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerRunning = $true
            Write-Success "  ✓ Docker is running"
        }
    } catch {
        Write-Error "  ✗ Docker is not running or not installed"
        return $false
    }
    
    if (-not $dockerRunning) {
        Write-Error "  ✗ Docker is not running"
        Write-Warning "  → Start Docker Desktop and try again"
        return $false
    }
    
    # Check container
    $containerRunning = $false
    $containerExists = $false
    try {
        $containerInfo = docker ps -a --filter "name=fireswarm_sitl" --format "{{.Names}}|{{.Status}}" 2>&1
        if ($containerInfo -match "fireswarm_sitl") {
            $containerExists = $true
            if ($containerInfo -match "Up") {
                $containerRunning = $true
                Write-Success "  ✓ Container is running"
            } else {
                Write-Warning "  ⚠ Container exists but is stopped"
            }
        } else {
            Write-Info "  → Container does not exist yet"
        }
    } catch {
        Write-Error "  ✗ Error checking container status"
    }
    
    # Check ports
    Write-Info "  → Checking ports..."
    $port14550 = $false
    $port5760 = $false
    try {
        $netstat = netstat -an | Select-String "14550|5760"
        if ($netstat -match "14550") {
            $port14550 = $true
            Write-Success "  ✓ Port 14550 is open (MAVProxy/QGroundControl)"
        }
        if ($netstat -match "5760") {
            $port5760 = $true
            Write-Success "  ✓ Port 5760 is open (ArduCopter)"
        }
    } catch {
        Write-Warning "  ⚠ Could not check ports"
    }
    
    # Check VcXsrv
    $vcxsrvRunning = $false
    try {
        $vcxsrv = Get-Process -Name "vcxsrv" -ErrorAction SilentlyContinue
        if ($vcxsrv) {
            $vcxsrvRunning = $true
            Write-Success "  ✓ VcXsrv is running (X Server for GUI)"
        } else {
            Write-Warning "  ⚠ VcXsrv is not running (GUI may not work)"
        }
    } catch {
        Write-Warning "  ⚠ Could not check VcXsrv"
    }
    
    Write-Host ""
    return @{
        DockerRunning = $dockerRunning
        ContainerRunning = $containerRunning
        ContainerExists = $containerExists
        Port14550 = $port14550
        Port5760 = $port5760
        VcXsrvRunning = $vcxsrvRunning
    }
}

# ============================================================
# Stop Function
# ============================================================
function Stop-Simulation {
    Write-Info "[STOP] Stopping simulation..."
    
    try {
        # Stop container
        docker-compose down 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✓ Container stopped"
        } else {
            Write-Warning "  ⚠ Container may not have been running"
        }
        
        # Remove container if it exists
        $containerExists = docker ps -a --filter "name=fireswarm_sitl" --format "{{.Names}}" 2>&1
        if ($containerExists -match "fireswarm_sitl") {
            docker rm -f fireswarm_sitl 2>&1 | Out-Null
            Write-Success "  ✓ Container removed"
        }
        
        Write-Success "[DONE] Simulation stopped"
        return $true
    } catch {
        Write-Error "  ✗ Error stopping simulation: $_"
        return $false
    }
}

# ============================================================
# Start VcXsrv Function
# ============================================================
function Start-VcXsrv {
    Write-Info "[VcXsrv] Checking X Server..."
    
    $vcxsrv = Get-Process -Name "vcxsrv" -ErrorAction SilentlyContinue
    if ($vcxsrv) {
        Write-Success "  ✓ VcXsrv is already running"
        return $true
    }
    
    Write-Warning "  ⚠ VcXsrv is not running"
    Write-Info "  → Attempting to start VcXsrv..."
    
    # Try to find VcXsrv
    $vcxsrvPaths = @(
        "${env:ProgramFiles}\VcXsrv\vcxsrv.exe",
        "${env:ProgramFiles(x86)}\VcXsrv\vcxsrv.exe",
        "$env:LOCALAPPDATA\Programs\VcXsrv\vcxsrv.exe"
    )
    
    $vcxsrvPath = $null
    foreach ($path in $vcxsrvPaths) {
        if (Test-Path $path) {
            $vcxsrvPath = $path
            break
        }
    }
    
    if ($vcxsrvPath) {
        Write-Info "  → Found VcXsrv at: $vcxsrvPath"
        Write-Warning "  ⚠ Starting VcXsrv with default settings..."
        Write-Warning "  ⚠ IMPORTANT: Make sure 'Disable access control' is checked!"
        Write-Info "  → Launching VcXsrv..."
        
        Start-Process $vcxsrvPath -ArgumentList "-ac" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        $vcxsrv = Get-Process -Name "vcxsrv" -ErrorAction SilentlyContinue
        if ($vcxsrv) {
            Write-Success "  ✓ VcXsrv started"
            return $true
        } else {
            Write-Error "  ✗ Failed to start VcXsrv"
            Write-Warning "  → Please start VcXsrv manually:"
            Write-Warning "    1. Open VcXsrv from Start Menu"
            Write-Warning "    2. Settings: Multiple windows, Display -1"
            Write-Warning "    3. Check 'Disable access control'"
            Write-Warning "    4. Click Finish"
            return $false
        }
    } else {
        Write-Error "  ✗ VcXsrv not found"
        Write-Warning "  → Please install VcXsrv: https://sourceforge.net/projects/vcxsrv/"
        Write-Warning "  → Or start it manually if already installed"
        return $false
    }
}

# ============================================================
# Main Logic
# ============================================================

# Handle Status command
if ($Status) {
    $status = Get-SimulationStatus
    Write-Host ""
    Write-Info "=================================================="
    Write-Info "  Status Summary"
    Write-Info "=================================================="
    Write-Host ""
    exit 0
}

# Handle Stop command
if ($Stop) {
    Stop-Simulation
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 0
}

# Check Docker
Write-Info "[CHECK] Verifying prerequisites..."
try {
    $null = docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running or not installed"
        Write-Warning "→ Please start Docker Desktop and try again"
        Read-Host "Press Enter to exit..."
        exit 1
    }
    Write-Success "  ✓ Docker is running"
} catch {
    Write-Error "Docker is not running or not installed"
    Write-Warning "→ Please start Docker Desktop and try again"
    Read-Host "Press Enter to exit..."
    exit 1
}

# Check/Start VcXsrv
$vcxsrvOk = Start-VcXsrv
if (-not $vcxsrvOk) {
    Write-Warning "[WARN] VcXsrv may not be running - GUI might not work"
    Write-Warning "       Continuing anyway... (you can start VcXsrv manually)"
}

# Handle Restart
if ($Restart) {
    Write-Info "[RESTART] Restarting simulation..."
    Stop-Simulation
    Start-Sleep -Seconds 2
}

# Check if container is already running
$containerRunning = $false
try {
    $containerInfo = docker ps --filter "name=fireswarm_sitl" --format "{{.Names}}" 2>&1
    if ($containerInfo -match "fireswarm_sitl") {
        $containerRunning = $true
    }
} catch {
    # Ignore
}

if ($containerRunning -and -not $Restart) {
    Write-Warning "[WARN] Container is already running!"
    Write-Info "  → Use -Restart to restart it"
    Write-Info "  → Use -Stop to stop it"
    Write-Info "  → Use -Status to check status"
    Write-Host ""
    Write-Info "Attaching to existing container..."
    Write-Info "Press Ctrl+C to detach (container will keep running)"
    Write-Host ""
    docker attach fireswarm_sitl
    exit 0
}

# Auto-detect DISPLAY for X11
if (-not $env:DISPLAY) {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\.254"
    } | Select-Object -First 1).IPAddress

    if ($IP) {
        $env:DISPLAY = "$($IP):0.0"
        Write-Info "[INFO] Auto-detected DISPLAY: $env:DISPLAY"
    } else {
        Write-Warning "[WARN] Could not auto-detect IP. Using default: 192.168.0.32:0.0"
        $env:DISPLAY = "192.168.0.32:0.0"
    }
} else {
    Write-Info "[INFO] Using DISPLAY: $env:DISPLAY"
}

# Check if image exists
$ImageExists = $false
try {
    $imageInfo = docker images fireswarm_sitl:latest --format "{{.Repository}}:{{.Tag}}" 2>$null
    $ImageExists = $imageInfo -match "fireswarm_sitl:latest"
} catch {
    # Ignore
}

# Build or start
Write-Host ""
if ($Build -or -not $ImageExists) {
    Write-Info "[BUILD] Building Docker image (this may take 5-10 minutes)..."
    Write-Info "       (First build only - subsequent starts are fast)"
    Write-Host ""
    docker-compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[ERROR] Docker build failed!"
        Read-Host "Press Enter to exit..."
        exit 1
    }
    Write-Success "[DONE] Build complete!"
    Write-Host ""
}

# Start simulation
Write-Info "[START] Starting simulation..."
Write-Info "       This will start:"
Write-Info "       - ArduCopter SITL (Flight Controller)"
Write-Info "       - Gazebo Garden (Physics Simulator)"
Write-Info "       - MAVProxy (Communication Bridge)"
Write-Host ""
Write-Info "[IMPORTANT]"
Write-Info "  → Gazebo GUI window should appear"
Write-Info "  → Connect QGroundControl to UDP:14550"
Write-Info "  → Press Ctrl+C to stop"
Write-Host ""

# Start container
docker-compose up

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Success "[DONE] Simulation stopped normally"
} else {
    Write-Error "[ERROR] Simulation exited with error code: $LASTEXITCODE"
    Write-Warning "       Check logs: docker logs fireswarm_sitl"
}

Write-Host ""
Read-Host "Press Enter to exit..."

