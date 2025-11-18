@echo off
title Stop Vibecoding Services
color 0E

echo ========================================
echo   Stopping Vibecoding Docker Services
echo ========================================
echo.

docker-compose down

if errorlevel 1 (
    echo [ERROR] Failed to stop services
    pause
    exit /b 1
)

echo.
echo [OK] All services stopped
echo.
pause

