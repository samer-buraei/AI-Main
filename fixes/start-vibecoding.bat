@echo off
setlocal enabledelayedexpansion
title Vibecoding Project Manager - Launcher
color 0A

REM CRITICAL: Ensure window NEVER closes unexpectedly
REM This wrapper catches ALL exits
if "%1" NEQ "wrapped" (
    cmd /k "%~f0 wrapped"
    exit /b
)

REM Clear screen for better visibility
cls

echo ========================================
echo   Vibecoding Project Manager Launcher
echo ========================================
echo.
echo Initializing launcher...
echo Please wait, checking system requirements...
echo.
timeout /t 3 /nobreak >nul

REM ========================================
REM  NODE.JS DETECTION AND VALIDATION
REM ========================================
echo [1/6] Checking Node.js installation...
set NODE_FOUND=0
set NODE_PATH=
set NODE_VERSION=

REM First, check if node is in PATH
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set NODE_FOUND=1
    REM Use a more robust method to get node path - avoid parsing issues
    set "NODE_PATH="
    for /f "usebackq delims=" %%i in (`where node 2^>nul`) do (
        if not defined NODE_PATH set "NODE_PATH=%%i"
    )
    if defined NODE_PATH (
        echo [OK] Node.js found in PATH: !NODE_PATH!
    ) else (
        echo [OK] Node.js found in PATH
    )
) else (
    echo [WARNING] Node.js not in PATH, scanning common installation locations...
    
    REM Check Program Files (64-bit)
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
        set NODE_PATH=%ProgramFiles%\nodejs\node.exe
        set NODE_FOUND=1
        echo [OK] Found Node.js at: %ProgramFiles%\nodejs
    )
    
    REM Check Program Files (32-bit)
    if !NODE_FOUND! EQU 0 if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
        set NODE_PATH=%ProgramFiles(x86)%\nodejs\node.exe
        set NODE_FOUND=1
        echo [OK] Found Node.js at: %ProgramFiles(x86)%\nodejs
    )
    
    REM Check Local AppData
    if !NODE_FOUND! EQU 0 if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
        set NODE_PATH=%LOCALAPPDATA%\Programs\nodejs\node.exe
        set NODE_FOUND=1
        echo [OK] Found Node.js at: %LOCALAPPDATA%\Programs\nodejs
    )
    
    REM Check AppData npm
    if !NODE_FOUND! EQU 0 if exist "%APPDATA%\npm\node.exe" (
        set "PATH=%APPDATA%\npm;%PATH%"
        set NODE_PATH=%APPDATA%\npm\node.exe
        set NODE_FOUND=1
        echo [OK] Found Node.js at: %APPDATA%\npm
    )
)

REM Verify Node.js is accessible and get version
if !NODE_FOUND! EQU 1 (
    node --version >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        REM Use a safer method to get version - avoid parsing issues
        set "NODE_VERSION="
        for /f "usebackq delims=" %%v in (`node --version 2^>nul`) do (
            if not defined NODE_VERSION set "NODE_VERSION=%%v"
        )
        if defined NODE_VERSION (
            echo [OK] Node.js version: !NODE_VERSION!
        ) else (
            echo [WARNING] Could not determine Node.js version
        )
    ) else (
        set NODE_FOUND=0
    )
)

REM If Node.js still not found, show comprehensive error
if !NODE_FOUND! EQU 0 (
    color 0C
    echo.
    echo ========================================
    echo   [ERROR] Node.js Not Found
    echo ========================================
    echo.
    echo Node.js is required but could not be found on your system.
    echo.
    echo DOWNLOAD NODE.JS:
    echo   https://nodejs.org/
    echo.
    echo After installation:
    echo   1. Make sure "Add to PATH" is checked
    echo   2. Restart your computer
    echo   3. Run this script again
    echo.
    echo ========================================
    echo.
    echo Window will stay open - press any key when ready to exit
    pause >nul
    exit /b 1
)

echo.
timeout /t 2 /nobreak >nul

REM ========================================
REM  NPM DETECTION AND VALIDATION
REM ========================================
echo [2/6] Checking npm installation...
set NPM_FOUND=0

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call npm --version >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set NPM_FOUND=1
        REM Use a safer method to get npm version - avoid parsing issues
        set "NPM_VERSION="
        for /f "usebackq delims=" %%v in (`npm --version 2^>nul`) do (
            if not defined NPM_VERSION set "NPM_VERSION=%%v"
        )
        if defined NPM_VERSION (
            echo [OK] npm found, version: !NPM_VERSION!
        ) else (
            echo [OK] npm found
        )
    )
)

if !NPM_FOUND! EQU 0 (
    color 0C
    echo.
    echo ========================================
    echo   [ERROR] npm Not Found
    echo ========================================
    echo.
    echo npm should be installed with Node.js
    echo Please reinstall Node.js from: https://nodejs.org/
    echo.
    echo ========================================
    echo.
    echo Window will stay open - press any key when ready to exit
    pause >nul
    exit /b 1
)

echo.
timeout /t 1 /nobreak >nul

REM ========================================
REM  PROJECT DIRECTORY VALIDATION
REM ========================================
echo [3/6] Checking project directories...
set MISSING_DIRS=0

if not exist "vibecoding-backend" (
    echo [ERROR] Missing: vibecoding-backend
    set /a MISSING_DIRS+=1
)

if not exist "vibecoding-dashboard" (
    echo [ERROR] Missing: vibecoding-dashboard
    set /a MISSING_DIRS+=1
)

if not exist "vibecoding-mcp-server" (
    echo [ERROR] Missing: vibecoding-mcp-server
    set /a MISSING_DIRS+=1
)

if !MISSING_DIRS! GTR 0 (
    color 0C
    echo.
    echo ========================================
    echo   [ERROR] Missing Project Directories
    echo ========================================
    echo.
    echo Make sure you run this script from the project root directory
    echo.
    echo Current directory: %CD%
    echo.
    echo ========================================
    echo.
    echo Window will stay open - press any key when ready to exit
    pause >nul
    exit /b 1
)

echo [OK] All project directories found
echo.
timeout /t 1 /nobreak >nul

REM ========================================
REM  DEPENDENCY INSTALLATION
REM ========================================
echo [4/6] Checking and installing dependencies...

REM Backend dependencies
if not exist "vibecoding-backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd vibecoding-backend
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] Backend dependency installation failed!
        cd ..
        echo.
        echo Window will stay open - press any key when ready to exit
        pause >nul
        exit /b 1
    )
    echo [OK] Backend dependencies installed
    cd ..
) else (
    echo [OK] Backend dependencies already installed
)

REM Frontend dependencies
if not exist "vibecoding-dashboard\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd vibecoding-dashboard
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] Frontend dependency installation failed!
        cd ..
        echo.
        echo Window will stay open - press any key when ready to exit
        pause >nul
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
    cd ..
) else (
    echo [OK] Frontend dependencies already installed
)

REM MCP Server dependencies
if not exist "vibecoding-mcp-server\node_modules" (
    echo [INFO] Installing MCP server dependencies...
    cd vibecoding-mcp-server
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] MCP server dependency installation failed!
        cd ..
        echo.
        echo Window will stay open - press any key when ready to exit
        pause >nul
        exit /b 1
    )
    echo [OK] MCP server dependencies installed
    cd ..
) else (
    echo [OK] MCP server dependencies already installed
)

echo [OK] All dependencies ready
echo.
timeout /t 1 /nobreak >nul

REM ========================================
REM  PORT AVAILABILITY CHECK
REM ========================================
echo [5/6] Checking port availability...

REM Check port 4000 (Backend)
netstat -an | findstr ":4000" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 4000 is already in use (Backend API)
) else (
    echo [OK] Port 4000 available (Backend API)
)

REM Check port 3000 (Frontend)
netstat -an | findstr ":3000" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 3000 is already in use (Frontend)
) else (
    echo [OK] Port 3000 available (Frontend)
)

REM Check port 4001 (MCP Server)
netstat -an | findstr ":4001" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 4001 is already in use (MCP Server)
) else (
    echo [OK] Port 4001 available (MCP Server)
)

echo.
timeout /t 1 /nobreak >nul

REM ========================================
REM  CREATE HELPER SCRIPTS FOR SERVICES
REM ========================================
echo [6/6] Creating service launchers...

REM Create Backend launcher
echo @echo off > start-backend-service.bat
echo title Vibecoding Backend >> start-backend-service.bat
echo cd /d "%~dp0vibecoding-backend" >> start-backend-service.bat
echo echo ======================================== >> start-backend-service.bat
echo echo   Vibecoding Backend API >> start-backend-service.bat
echo echo ======================================== >> start-backend-service.bat
echo echo. >> start-backend-service.bat
echo echo Starting on port 4000... >> start-backend-service.bat
echo echo. >> start-backend-service.bat
echo npm run dev >> start-backend-service.bat
echo if %%ERRORLEVEL%% NEQ 0 ( >> start-backend-service.bat
echo   echo. >> start-backend-service.bat
echo   echo [ERROR] Backend failed to start! >> start-backend-service.bat
echo   echo. >> start-backend-service.bat
echo   pause >> start-backend-service.bat
echo ) >> start-backend-service.bat

REM Create Frontend launcher
echo @echo off > start-frontend-service.bat
echo title Vibecoding Frontend >> start-frontend-service.bat
echo cd /d "%~dp0vibecoding-dashboard" >> start-frontend-service.bat
echo echo ======================================== >> start-frontend-service.bat
echo echo   Vibecoding Frontend Dashboard >> start-frontend-service.bat
echo echo ======================================== >> start-frontend-service.bat
echo echo. >> start-frontend-service.bat
echo echo Starting on port 3000... >> start-frontend-service.bat
echo echo. >> start-frontend-service.bat
echo npm start >> start-frontend-service.bat
echo if %%ERRORLEVEL%% NEQ 0 ( >> start-frontend-service.bat
echo   echo. >> start-frontend-service.bat
echo   echo [ERROR] Frontend failed to start! >> start-frontend-service.bat
echo   echo. >> start-frontend-service.bat
echo   pause >> start-frontend-service.bat
echo ) >> start-frontend-service.bat

REM Create MCP Server launcher
echo @echo off > start-mcp-service.bat
echo title Vibecoding MCP Server >> start-mcp-service.bat
echo cd /d "%~dp0vibecoding-mcp-server" >> start-mcp-service.bat
echo echo ======================================== >> start-mcp-service.bat
echo echo   Vibecoding MCP Server >> start-mcp-service.bat
echo echo ======================================== >> start-mcp-service.bat
echo echo. >> start-mcp-service.bat
echo echo Starting on port 4001... >> start-mcp-service.bat
echo echo. >> start-mcp-service.bat
echo npm run dev >> start-mcp-service.bat
echo if %%ERRORLEVEL%% NEQ 0 ( >> start-mcp-service.bat
echo   echo. >> start-mcp-service.bat
echo   echo [ERROR] MCP Server failed to start! >> start-mcp-service.bat
echo   echo. >> start-mcp-service.bat
echo   pause >> start-mcp-service.bat
echo ) >> start-mcp-service.bat

echo [OK] Service launchers created
echo.

REM ========================================
REM  START SERVICES
REM ========================================
echo ========================================
echo   Starting All Services
echo ========================================
echo.
echo Backend API:     http://localhost:4000
echo Frontend:        http://localhost:3000
echo MCP Server:      http://localhost:4001
echo.
echo ========================================
echo.

REM Start services using the helper scripts
echo [INFO] Starting Backend API...
start "Vibecoding Backend" cmd /k "%~dp0start-backend-service.bat"
timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend Dashboard...
start "Vibecoding Frontend" cmd /k "%~dp0start-frontend-service.bat"
timeout /t 2 /nobreak >nul

echo [INFO] Starting MCP Server...
start "Vibecoding MCP Server" cmd /k "%~dp0start-mcp-service.bat"
timeout /t 2 /nobreak >nul

echo.
color 0A
echo ========================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Services are running in separate windows.
echo The frontend will open in your browser shortly.
echo.
echo To stop services: Close their respective windows
echo.
echo ========================================
echo.
echo This window will stay open until you close it
echo Press any key to close this launcher window
echo (Services will continue running)
echo ========================================
pause >nul
