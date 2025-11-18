@echo off
title Vibecoding Backend
cd /d "%~dp0vibecoding-backend"
echo ========================================
echo   Vibecoding Backend API
echo ========================================
echo.
echo Starting on port 4000...
echo.
npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Backend failed to start
    echo.
    pause
)
