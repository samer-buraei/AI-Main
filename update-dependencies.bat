@echo off
setlocal enabledelayedexpansion
title Safe Dependency Updater
color 0E

echo ========================================
echo   Safe Dependency Updater
echo ========================================
echo.
echo WARNING: This will update dependencies to latest compatible versions
echo.
echo What this does:
echo   1. Updates all packages within semver ranges (^1.0.0 to ^1.9.9)
echo   2. Does NOT update major versions (avoids breaking changes)
echo   3. Updates package-lock.json
echo.
echo You should:
echo   - Commit current code first
echo   - Test thoroughly after updating
echo   - Update one project at a time
echo.
echo ========================================
echo.

choice /c 123 /n /m "Update: [1] Backend  [2] Frontend  [3] MCP Server: "
set CHOICE=%ERRORLEVEL%

if %CHOICE% EQU 1 (
    set "PROJECT=vibecoding-backend"
    set "NAME=Backend"
)
if %CHOICE% EQU 2 (
    set "PROJECT=vibecoding-dashboard"
    set "NAME=Frontend"
)
if %CHOICE% EQU 3 (
    set "PROJECT=vibecoding-mcp-server"
    set "NAME=MCP Server"
)

echo.
echo Updating %NAME%...
echo.

cd "%PROJECT%"

echo [1/3] Backing up package-lock.json...
copy package-lock.json package-lock.json.backup >nul 2>nul

echo [2/3] Updating dependencies (this may take 2-3 minutes)...
npm update --save

if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] Update failed!
    echo.
    echo Restoring backup...
    copy package-lock.json.backup package-lock.json >nul 2>nul
    pause
    exit /b 1
)

echo [3/3] Verifying installation...
npm list --depth=0

cd ..

echo.
color 0A
echo ========================================
echo   Update Complete!
echo ========================================
echo.
echo Backup saved as: package-lock.json.backup
echo.
echo Next steps:
echo   1. Test the application
echo   2. If everything works: delete backup
echo   3. If issues: restore backup and report issue
echo.
pause

