# Vibecoding Project Manager Launcher (PowerShell)
# Run with: .\start-vibecoding.ps1

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Vibecoding Project Manager Launcher" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if directories exist
$directories = @("vibecoding-backend", "vibecoding-dashboard", "vibecoding-mcp-server")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        Write-Host "[ERROR] $dir directory not found!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "[OK] All project directories found" -ForegroundColor Green
Write-Host ""

# Check and install dependencies
Write-Host "Checking dependencies..." -ForegroundColor Cyan

$projects = @(
    @{Name="Backend"; Path="vibecoding-backend"},
    @{Name="Frontend"; Path="vibecoding-dashboard"},
    @{Name="MCP Server"; Path="vibecoding-mcp-server"}
)

foreach ($project in $projects) {
    $nodeModulesPath = Join-Path $project.Path "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "[INFO] Installing $($project.Name) dependencies..." -ForegroundColor Yellow
        Set-Location $project.Path
        npm install
        Set-Location ..
    }
}

Write-Host "[OK] Dependencies ready" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Services..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:     http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend:        http://localhost:3000" -ForegroundColor Cyan
Write-Host "MCP Server:      http://localhost:4001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in any window to stop that service" -ForegroundColor Yellow
Write-Host "Close all windows to stop everything" -ForegroundColor Yellow
Write-Host ""

# Function to start a service in a new window
function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Path,
        [string]$Command
    )
    
    $scriptPath = Join-Path $PSScriptRoot $Path
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; Write-Host '[$Title] Starting...' -ForegroundColor Green; $Command"
}

# Start Backend
Write-Host "[INFO] Starting Backend API..." -ForegroundColor Yellow
Start-ServiceWindow -Title "Backend" -Path "vibecoding-backend" -Command "npm run dev"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[INFO] Starting Frontend Dashboard..." -ForegroundColor Yellow
Start-ServiceWindow -Title "Frontend" -Path "vibecoding-dashboard" -Command "npm start"
Start-Sleep -Seconds 2

# Start MCP Server
Write-Host "[INFO] Starting MCP Server..." -ForegroundColor Yellow
Start-ServiceWindow -Title "MCP Server" -Path "vibecoding-mcp-server" -Command "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are running in separate windows." -ForegroundColor Cyan
Write-Host "The frontend will open automatically in your browser." -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, close all the PowerShell windows." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to close this window (services will keep running)"

