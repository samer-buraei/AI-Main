@echo off
REM ============================================================
REM  FireSwarm Simulation - Complete Startup Script (Batch)
REM  "go-simulation.bat" - One script to start it all!
REM ============================================================

setlocal

REM Check for PowerShell and use it if available
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Using PowerShell version...
    powershell -ExecutionPolicy Bypass -File "%~dp0go-simulation.ps1" %*
    exit /b %ERRORLEVEL%
)

REM Fallback to basic batch commands
echo ==================================================
echo   FireSwarm Simulation Manager (Basic Mode)
echo ==================================================
echo.

REM Navigate to simulation directory
cd /d "%~dp0simulation"
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found!
    echo         Make sure you're in the correct directory.
    pause
    exit /b 1
)

REM Check Docker
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running or not installed
    echo         Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Auto-detect DISPLAY (basic)
if "%DISPLAY%"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
        set IP=%%a
        set IP=!IP:~1!
        goto :found_ip
    )
    :found_ip
    if defined IP (
        set DISPLAY=!IP!:0.0
        echo [INFO] Auto-detected DISPLAY: %DISPLAY%
    ) else (
        set DISPLAY=192.168.0.32:0.0
        echo [WARN] Using default DISPLAY: %DISPLAY%
    )
)

REM Check if container is running
docker ps --filter "name=fireswarm_sitl" --format "{{.Names}}" | findstr "fireswarm_sitl" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARN] Container is already running!
    echo        Use PowerShell version for more options: go-simulation.ps1
    echo.
    echo Attaching to existing container...
    docker attach fireswarm_sitl
    exit /b %ERRORLEVEL%
)

REM Start simulation
echo [START] Starting simulation...
echo.
docker-compose up

if %ERRORLEVEL% EQU 0 (
    echo [DONE] Simulation stopped normally
) else (
    echo [ERROR] Simulation exited with error
)

pause

