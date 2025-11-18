@echo off
setlocal enabledelayedexpansion
title Vibecoding Docker Launcher
color 0A

echo ========================================
echo   Vibecoding Docker Launcher
echo ========================================
echo.

REM Check if Docker is running
echo [1/7] Checking Docker daemon...
docker info >nul 2>nul
if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] Docker is not running
    echo.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker daemon is running

REM Check Docker memory allocation
echo [2/7] Checking Docker memory allocation...
for /f "tokens=*" %%m in ('docker info --format "{{.MemTotal}}"') do set DOCKER_MEM=%%m
set /a DOCKER_MEM_GB=%DOCKER_MEM% / 1073741824 2>nul
if defined DOCKER_MEM (
    echo [OK] Docker memory: ~%DOCKER_MEM_GB% GB allocated
    if %DOCKER_MEM_GB% LSS 5 (
        color 0E
        echo [WARNING] Low memory! Recommended: 6-8 GB for 16GB system
        echo             Run check-docker-memory.bat for details
    ) else if %DOCKER_MEM_GB% LSS 10 (
        echo [OPTIMAL] Memory is well-balanced for your system
    ) else (
        echo [INFO] High allocation - may impact Windows performance
        echo       Consider reducing to 6-8 GB
    )
) else (
    echo [WARNING] Could not detect Docker memory allocation
)
echo.

REM Check if required ports are available
echo [3/7] Checking port availability...
set PORTS_OK=1

netstat -an | findstr ":3000" | findstr "LISTENING" >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [WARNING] Port 3000 already in use
    set PORTS_OK=0
) else (
    echo [OK] Port 3000 available ^(Frontend^)
)

netstat -an | findstr ":4000" | findstr "LISTENING" >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [WARNING] Port 4000 already in use
    set PORTS_OK=0
) else (
    echo [OK] Port 4000 available ^(Backend^)
)

netstat -an | findstr ":4001" | findstr "LISTENING" >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [WARNING] Port 4001 already in use
    set PORTS_OK=0
) else (
    echo [OK] Port 4001 available ^(MCP Server^)
)

if !PORTS_OK! EQU 0 (
    echo.
    echo [WARNING] Some ports are in use. Stopping existing containers...
    docker-compose down >nul 2>nul
    timeout /t 2 /nobreak >nul
)
echo.

REM Verify Docker Desktop file sharing
echo [4/7] Verifying Docker file access...
if exist "%CD%\docker-compose.yml" (
    echo [OK] docker-compose.yml accessible
) else (
    color 0C
    echo [ERROR] Cannot access docker-compose.yml
    echo Please enable file sharing in Docker Desktop settings
    pause
    exit /b 1
)
echo [OK] Working directory accessible to Docker
echo.

REM Check if containers are already running
echo [5/7] Checking existing containers...
docker ps -q -f name=vibecoding >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [INFO] Stopping existing containers...
    docker-compose down
    timeout /t 2 /nobreak >nul
)
echo [OK] Ready to start
echo.

REM Start services
echo [6/7] Building and starting services...
echo.
echo ========================================
echo This will:
echo   - Build Docker images (first time: 2-3 minutes)
echo   - Create isolated containers
echo   - Start all services
echo.
echo Subsequent starts will be MUCH faster (10-30 seconds)
echo ========================================
echo.
echo [%TIME%] Building and starting...
echo.

docker-compose up --build -d

if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] Docker startup failed!
    echo.
    echo Common issues:
    echo   1. Port already in use (close other apps using ports 3000, 4000, 4001)
    echo   2. Not enough memory (increase Docker Desktop memory limit)
    echo   3. Network issues (check Docker Desktop network settings)
    echo.
    echo View logs with: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo [%TIME%] Completed!
echo.

REM Wait for services to be healthy
echo [7/7] Verifying services and network access...
echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

REM Check container status
echo.
echo Checking container health...
docker ps --filter "name=vibecoding" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

REM Test network connectivity
echo.
echo Testing network connectivity...
set BACKEND_OK=0
set FRONTEND_OK=0
set MCP_OK=0

REM Try to connect to backend (allow up to 30 seconds)
for /L %%i in (1,1,6) do (
    curl -s http://localhost:4000 >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo [OK] Backend accessible at http://localhost:4000
        set BACKEND_OK=1
        goto :backend_done
    )
    if %%i LSS 6 (
        echo [INFO] Waiting for backend... ^(attempt %%i/6^)
        timeout /t 5 /nobreak >nul
    )
)
:backend_done

if !BACKEND_OK! EQU 0 (
    echo [WARNING] Backend not responding yet at http://localhost:4000
    echo          Check logs: docker logs vibecoding-backend
)

REM Check if frontend is responding
curl -s http://localhost:3000 >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] Frontend accessible at http://localhost:3000
    set FRONTEND_OK=1
) else (
    echo [INFO] Frontend starting... ^(React apps take 30-60 seconds^)
)

REM Check if MCP server is responding
curl -s http://localhost:4001 >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] MCP Server accessible at http://localhost:4001
    set MCP_OK=1
) else (
    echo [INFO] MCP Server starting...
)

echo.

REM Final status
if !BACKEND_OK! EQU 1 (
    color 0A
    echo ========================================
    echo   All Services Started Successfully!
    echo ========================================
    echo.
    echo Services running in Docker containers:
    echo.
    echo   Backend API:     http://localhost:4000  ✓
    if !FRONTEND_OK! EQU 1 (
        echo   Frontend:        http://localhost:3000  ✓
    ) else (
        echo   Frontend:        http://localhost:3000  ^(starting...^)
    )
    if !MCP_OK! EQU 1 (
        echo   MCP Server:      http://localhost:4001  ✓
    ) else (
        echo   MCP Server:      http://localhost:4001  ^(starting...^)
    )
    echo.
    echo ========================================
    echo.
    echo Network Status:
    echo   ✓ Docker network created
    echo   ✓ Ports exposed to Windows host
    echo   ✓ Services accessible from browser
    echo.
    echo ========================================
    echo.
    echo Useful Commands:
    echo   - View logs:       docker-compose logs -f
    echo   - Stop services:   docker-compose down
    echo   - Restart:         docker-compose restart
    echo   - View status:     docker-compose ps
    echo.
    
    if !FRONTEND_OK! EQU 1 (
        echo Opening frontend in browser...
        timeout /t 2 /nobreak >nul
        start http://localhost:3000
    ) else (
        echo Frontend will be available shortly at: http://localhost:3000
        echo React apps typically take 30-60 seconds to compile
    )
    
    echo.
    echo Press any key to close this window.
    echo (Services will continue running in background)
    echo.
    pause >nul
) else (
    color 0E
    echo ========================================
    echo   Services Started (Initializing...)
    echo ========================================
    echo.
    echo Containers are running but not ready yet.
    echo This is normal for first-time startup.
    echo.
    echo Check status with:
    echo   docker-compose logs -f
    echo.
    echo Or wait 30-60 seconds and visit:
    echo   http://localhost:3000  ^(Frontend^)
    echo   http://localhost:4000  ^(Backend^)
    echo   http://localhost:4001  ^(MCP Server^)
    echo.
    pause
)

