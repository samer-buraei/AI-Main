@echo off
setlocal enabledelayedexpansion
title Docker Network Test
color 0B

echo ========================================
echo   Docker Network Connectivity Test
echo ========================================
echo.

REM Check if containers are running
echo [1/4] Checking running containers...
docker ps --filter "name=vibecoding" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [2/4] Testing port accessibility from Windows host...
echo.

REM Test Backend
echo Testing Backend (port 4000)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:4000 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] Backend is accessible
) else (
    echo [ERROR] Backend not accessible
)

echo.
echo Testing Frontend (port 3000)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] Frontend is accessible
) else (
    echo [WARNING] Frontend not ready yet
)

echo.
echo Testing MCP Server (port 4001)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:4001 2>nul
if !ERRORLEVEL! EQU 0 (
    echo [OK] MCP Server is accessible
) else (
    echo [WARNING] MCP Server not ready yet
)

echo.
echo [3/4] Checking Docker network configuration...
docker network inspect aimain_vibecoding-network --format "{{.Name}}: {{.Driver}}" 2>nul
if errorlevel 1 (
    echo [INFO] Network not created yet
) else (
    echo [OK] Docker network configured correctly
)

echo.
echo [4/4] Checking port bindings...
docker port vibecoding-backend 2>nul
docker port vibecoding-frontend 2>nul
docker port vibecoding-mcp 2>nul

echo.
echo ========================================
echo   Test Complete
echo ========================================
echo.
echo If services show as accessible, Docker networking is working correctly.
echo If not, wait 30-60 seconds and run this test again.
echo.
pause

