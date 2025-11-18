@echo off
setlocal enabledelayedexpansion
title NPM Error Fix - Clean Install
color 0E

echo ========================================
echo   NPM Installation Error Fix
echo ========================================
echo.
echo This will:
echo   1. Stop any running Node processes
echo   2. Clean npm cache
echo   3. Remove node_modules folders
echo   4. Perform fresh installation
echo.
echo This may take 5-10 minutes.
echo.
pause

REM Stop any running npm/node processes
echo [1/5] Stopping Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
timeout /t 2 /nobreak >nul
echo [OK] Processes stopped
echo.

REM Clean npm cache
echo [2/5] Cleaning npm cache...
call npm cache clean --force
if errorlevel 1 (
    echo [WARNING] Cache clean failed, continuing...
) else (
    echo [OK] Cache cleaned
)
echo.

REM Remove node_modules directories
echo [3/5] Removing old node_modules folders...
echo This may take a while...
echo.

if exist "vibecoding-backend\node_modules" (
    echo   - Removing backend node_modules...
    rd /s /q "vibecoding-backend\node_modules" 2>nul
)

if exist "vibecoding-dashboard\node_modules" (
    echo   - Removing frontend node_modules...
    rd /s /q "vibecoding-dashboard\node_modules" 2>nul
)

if exist "vibecoding-mcp-server\node_modules" (
    echo   - Removing MCP server node_modules...
    rd /s /q "vibecoding-mcp-server\node_modules" 2>nul
)

echo [OK] Old installations removed
echo.

REM Remove package-lock files to prevent cache issues
echo [4/5] Removing package-lock files...
del /f "vibecoding-backend\package-lock.json" 2>nul
del /f "vibecoding-dashboard\package-lock.json" 2>nul
del /f "vibecoding-mcp-server\package-lock.json" 2>nul
echo [OK] Lock files removed
echo.

REM Reinstall with npm
echo [5/5] Running fresh installation...
echo.
echo IMPORTANT: Close any antivirus/file monitoring tools for faster installation
echo.
timeout /t 5 /nobreak

REM Use npm ci (clean install) with legacy peer deps
echo ========================================
echo Installing Backend Dependencies
echo ========================================
cd vibecoding-backend
call npm install --legacy-peer-deps --verbose
if errorlevel 1 (
    color 0C
    echo [ERROR] Backend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend complete
echo.

echo ========================================
echo Installing Frontend Dependencies
echo ========================================
cd vibecoding-dashboard
call npm install --legacy-peer-deps --verbose
if errorlevel 1 (
    color 0C
    echo [ERROR] Frontend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend complete
echo.

echo ========================================
echo Installing MCP Server Dependencies
echo ========================================
cd vibecoding-mcp-server
call npm install --legacy-peer-deps --verbose
if errorlevel 1 (
    color 0C
    echo [ERROR] MCP installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] MCP Server complete
echo.

color 0A
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo All dependencies installed successfully.
echo You can now run start-vibecoding.bat
echo.
pause

