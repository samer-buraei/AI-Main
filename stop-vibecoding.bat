@echo off
title Vibecoding Project Manager - Stop All Services
color 0C

echo ========================================
echo   Stopping All Vibecoding Services
echo ========================================
echo.

REM Kill Node.js processes (this will stop all Node services)
echo [INFO] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [OK] All services stopped successfully
) else (
    echo [INFO] No running services found (or already stopped)
)

echo.
echo All Vibecoding services have been stopped.
echo.
pause

