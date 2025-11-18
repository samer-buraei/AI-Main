@echo off
setlocal enabledelayedexpansion
title Vibecoding Smart Launcher
color 0B

echo ========================================
echo   Vibecoding Smart Launcher
echo ========================================
echo.
echo Detecting best startup method...
echo.

REM Check if Docker is available and running
docker info >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    set DOCKER_AVAILABLE=1
    echo [DETECTED] Docker is running
) else (
    set DOCKER_AVAILABLE=0
    echo [INFO] Docker not available
)

REM Check if node_modules exist (previous npm install)
if exist "vibecoding-backend\node_modules" (
    set NPM_INSTALLED=1
    echo [DETECTED] NPM dependencies already installed
) else (
    set NPM_INSTALLED=0
    echo [INFO] NPM dependencies not installed
)

echo.
echo ========================================
echo   Choose Startup Method
echo ========================================
echo.

if !DOCKER_AVAILABLE! EQU 1 (
    color 0A
    echo RECOMMENDED: Docker (Fast, Isolated, No filesystem errors)
    echo.
    echo   1. Docker (RECOMMENDED)
    echo      - First time: 2-3 minutes (build images)
    echo      - After: 10-30 seconds
    echo      - No Windows path/filesystem issues
    echo      - Clean, isolated environment
    echo.
    echo   2. Node.js Direct
    if !NPM_INSTALLED! EQU 1 (
        echo      - Quick start (dependencies installed^)
    ) else (
        echo      - Slower first time (5-10 minutes npm install^)
        echo      - May encounter Windows filesystem errors
    )
    echo.
    echo   3. Exit
    echo.
    choice /c 123 /n /m "Your choice (1=Docker, 2=Node.js, 3=Exit): "
    set CHOICE=!ERRORLEVEL!
) else (
    color 0E
    echo AVAILABLE: Node.js Direct Only
    echo.
    echo   1. Node.js Direct
    if !NPM_INSTALLED! EQU 1 (
        echo      - Quick start (dependencies installed^)
    ) else (
        echo      - First time: 5-10 minutes (npm install^)
        echo      - May encounter Windows filesystem errors
    )
    echo.
    echo   2. Install Docker (Recommended for better experience)
    echo   3. Exit
    echo.
    choice /c 123 /n /m "Your choice: "
    set CHOICE=!ERRORLEVEL!
)

echo.

if !DOCKER_AVAILABLE! EQU 1 (
    if !CHOICE! EQU 1 (
        echo Starting with Docker...
        call start-vibecoding-docker.bat
    ) else if !CHOICE! EQU 2 (
        echo Starting with Node.js...
        call start-vibecoding.bat
    ) else (
        echo Exiting...
        exit /b 0
    )
) else (
    if !CHOICE! EQU 1 (
        echo Starting with Node.js...
        call start-vibecoding.bat
    ) else if !CHOICE! EQU 2 (
        echo.
        echo Opening Docker Desktop download page...
        start https://www.docker.com/products/docker-desktop/
        echo.
        echo After installing Docker:
        echo   1. Restart your computer
        echo   2. Start Docker Desktop
        echo   3. Run this script again
        echo.
        pause
    ) else (
        echo Exiting...
        exit /b 0
    )
)

