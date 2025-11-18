@echo off
setlocal enabledelayedexpansion
title Vibecoding Project Manager - Launcher
color 0A

REM Setup error logging
set "LOGFILE=%~dp0launcher-debug.log"
echo ======================================== > "%LOGFILE%"
echo Vibecoding Launcher Debug Log >> "%LOGFILE%"
echo Started: %DATE% %TIME% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

cls
echo ========================================
echo   Vibecoding Project Manager Launcher
echo ========================================
echo.
echo Initializing launcher...
echo Debug log: %LOGFILE%
echo.

REM ========================================
REM  NODE.JS DETECTION
REM ========================================
echo [1/6] Checking Node.js installation...
echo [LOG] [1/6] Starting Node.js detection >> "%LOGFILE%"

where node >nul 2>nul
if errorlevel 1 (
    echo [LOG] Node not in PATH >> "%LOGFILE%"
    color 0C
    echo.
    echo [ERROR] Node.js Not Found
    echo.
    echo Node.js is required but not found in PATH.
    echo Download from: https://nodejs.org/
    echo.
    echo After installation, restart your computer.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo [LOG] Node.js found in PATH >> "%LOGFILE%"

for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VERSION=%%v
if defined NODE_VERSION (
    echo [OK] Node.js version: %NODE_VERSION%
    echo [LOG] NODE_VERSION: %NODE_VERSION% >> "%LOGFILE%"
)

echo.

REM ========================================
REM  NPM DETECTION
REM ========================================
echo [2/6] Checking npm installation...
echo [LOG] [2/6] Starting npm detection >> "%LOGFILE%"

where npm >nul 2>nul
if errorlevel 1 (
    echo [LOG] npm not found >> "%LOGFILE%"
    color 0C
    echo.
    echo [ERROR] npm Not Found
    echo.
    echo npm should be installed with Node.js.
    echo Please reinstall Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] npm found
echo [LOG] npm found in PATH >> "%LOGFILE%"

for /f "tokens=*" %%v in ('npm --version 2^>nul') do set NPM_VERSION=%%v
if defined NPM_VERSION (
    echo [OK] npm version: %NPM_VERSION%
    echo [LOG] NPM_VERSION: %NPM_VERSION% >> "%LOGFILE%"
)

echo.

REM ========================================
REM  PROJECT DIRECTORY VALIDATION
REM ========================================
echo [3/6] Checking project directories...
echo [LOG] [3/6] Checking project directories >> "%LOGFILE%"
echo [LOG] Current directory: %CD% >> "%LOGFILE%"

set MISSING_DIRS=0

if not exist "vibecoding-backend" (
    echo [ERROR] Missing: vibecoding-backend
    echo [LOG] Missing: vibecoding-backend >> "%LOGFILE%"
    set /a MISSING_DIRS+=1
) else (
    echo [LOG] Found: vibecoding-backend >> "%LOGFILE%"
)

if not exist "vibecoding-dashboard" (
    echo [ERROR] Missing: vibecoding-dashboard
    echo [LOG] Missing: vibecoding-dashboard >> "%LOGFILE%"
    set /a MISSING_DIRS+=1
) else (
    echo [LOG] Found: vibecoding-dashboard >> "%LOGFILE%"
)

if not exist "vibecoding-mcp-server" (
    echo [ERROR] Missing: vibecoding-mcp-server
    echo [LOG] Missing: vibecoding-mcp-server >> "%LOGFILE%"
    set /a MISSING_DIRS+=1
) else (
    echo [LOG] Found: vibecoding-mcp-server >> "%LOGFILE%"
)

if %MISSING_DIRS% GTR 0 (
    echo [LOG] ERROR: Missing directories >> "%LOGFILE%"
    color 0C
    echo.
    echo [ERROR] Missing Project Directories
    echo.
    echo Run this script from the project root directory.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo [OK] All project directories found
echo [LOG] All directories found >> "%LOGFILE%"
echo.

REM ========================================
REM  DEPENDENCY INSTALLATION
REM ========================================
echo [4/6] Checking and installing dependencies...
echo [LOG] [4/6] Checking dependencies >> "%LOGFILE%"

REM Backend dependencies
if not exist "vibecoding-backend\node_modules" (
    echo.
    echo ========================================
    echo [INFO] Installing backend dependencies...
    echo ========================================
    echo This may take 1-3 minutes depending on your internet speed.
    echo Progress will be shown below...
    echo.
    echo [LOG] Installing backend dependencies >> "%LOGFILE%"
    cd vibecoding-backend
    
    REM Show npm progress with timestamps
    echo [%TIME%] Starting npm install for backend...
    call npm install --loglevel=info
    
    if errorlevel 1 (
        echo [LOG] ERROR: Backend npm install failed >> "%LOGFILE%"
        color 0C
        echo.
        echo [ERROR] Backend dependency installation failed!
        cd ..
        echo.
        echo Check debug log: %LOGFILE%
        pause
        exit /b 1
    )
    echo [%TIME%] Completed!
    echo [OK] Backend dependencies installed
    echo.
    cd ..
) else (
    echo [OK] Backend dependencies already installed
    echo [LOG] Backend dependencies already exist >> "%LOGFILE%"
)

REM Frontend dependencies
if not exist "vibecoding-dashboard\node_modules" (
    echo.
    echo ========================================
    echo [INFO] Installing frontend dependencies...
    echo ========================================
    echo React apps have many dependencies - this may take 2-4 minutes.
    echo Progress will be shown below...
    echo.
    echo [LOG] Installing frontend dependencies >> "%LOGFILE%"
    cd vibecoding-dashboard
    
    REM Show npm progress with timestamps
    echo [%TIME%] Starting npm install for frontend...
    call npm install --loglevel=info
    
    if errorlevel 1 (
        echo [LOG] ERROR: Frontend npm install failed >> "%LOGFILE%"
        color 0C
        echo.
        echo [ERROR] Frontend dependency installation failed!
        cd ..
        echo.
        echo Check debug log: %LOGFILE%
        pause
        exit /b 1
    )
    echo [%TIME%] Completed!
    echo [OK] Frontend dependencies installed
    echo.
    cd ..
) else (
    echo [OK] Frontend dependencies already installed
    echo [LOG] Frontend dependencies already exist >> "%LOGFILE%"
)

REM MCP Server dependencies
if not exist "vibecoding-mcp-server\node_modules" (
    echo.
    echo ========================================
    echo [INFO] Installing MCP server dependencies...
    echo ========================================
    echo Final installation step - this may take 1-2 minutes.
    echo Progress will be shown below...
    echo.
    echo [LOG] Installing MCP server dependencies >> "%LOGFILE%"
    cd vibecoding-mcp-server
    
    REM Show npm progress with timestamps
    echo [%TIME%] Starting npm install for MCP server...
    call npm install --loglevel=info
    
    if errorlevel 1 (
        echo [LOG] ERROR: MCP npm install failed >> "%LOGFILE%"
        color 0C
        echo.
        echo [ERROR] MCP server dependency installation failed!
        cd ..
        echo.
        echo Check debug log: %LOGFILE%
        pause
        exit /b 1
    )
    echo [%TIME%] Completed!
    echo [OK] MCP server dependencies installed
    echo.
    cd ..
) else (
    echo [OK] MCP server dependencies already installed
    echo [LOG] MCP server dependencies already exist >> "%LOGFILE%"
)

echo [OK] All dependencies ready
echo [LOG] All dependencies ready >> "%LOGFILE%"
echo.

REM ========================================
REM  CREATE HELPER SCRIPTS FOR SERVICES
REM ========================================
echo [5/6] Creating service launchers...
echo [LOG] [5/6] Creating helper scripts >> "%LOGFILE%"

REM Create Backend launcher
(
    echo @echo off
    echo title Vibecoding Backend
    echo cd /d "%%~dp0vibecoding-backend"
    echo echo ========================================
    echo echo   Vibecoding Backend API
    echo echo ========================================
    echo echo.
    echo echo Starting on port 4000...
    echo echo.
    echo npm run dev
    echo if errorlevel 1 ^(
    echo     echo.
    echo     echo [ERROR] Backend failed to start!
    echo     echo.
    echo     pause
    echo ^)
) > start-backend-service.bat
echo [LOG] Created start-backend-service.bat >> "%LOGFILE%"

REM Create Frontend launcher
(
    echo @echo off
    echo title Vibecoding Frontend
    echo cd /d "%%~dp0vibecoding-dashboard"
    echo echo ========================================
    echo echo   Vibecoding Frontend Dashboard
    echo echo ========================================
    echo echo.
    echo echo Starting on port 3000...
    echo echo.
    echo npm start
    echo if errorlevel 1 ^(
    echo     echo.
    echo     echo [ERROR] Frontend failed to start!
    echo     echo.
    echo     pause
    echo ^)
) > start-frontend-service.bat
echo [LOG] Created start-frontend-service.bat >> "%LOGFILE%"

REM Create MCP Server launcher
(
    echo @echo off
    echo title Vibecoding MCP Server
    echo cd /d "%%~dp0vibecoding-mcp-server"
    echo echo ========================================
    echo echo   Vibecoding MCP Server
    echo echo ========================================
    echo echo.
    echo echo Starting on port 4001...
    echo echo.
    echo npm run dev
    echo if errorlevel 1 ^(
    echo     echo.
    echo     echo [ERROR] MCP Server failed to start!
    echo     echo.
    echo     pause
    echo ^)
) > start-mcp-service.bat
echo [LOG] Created start-mcp-service.bat >> "%LOGFILE%"

echo [OK] Service launchers created
echo.

REM ========================================
REM  START SERVICES
REM ========================================
echo [6/6] Starting services...
echo.
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
echo [LOG] Starting backend service >> "%LOGFILE%"
start "Vibecoding Backend" cmd /k "%~dp0start-backend-service.bat"
timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend Dashboard...
echo [LOG] Starting frontend service >> "%LOGFILE%"
start "Vibecoding Frontend" cmd /k "%~dp0start-frontend-service.bat"
timeout /t 2 /nobreak >nul

echo [INFO] Starting MCP Server...
echo [LOG] Starting MCP service >> "%LOGFILE%"
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
echo Debug log saved to: %LOGFILE%
echo.
echo This window will stay open until you close it.
echo Press any key to close this launcher window.
echo (Services will continue running)
echo ========================================
echo [LOG] Script completed successfully >> "%LOGFILE%"
echo [LOG] End time: %DATE% %TIME% >> "%LOGFILE%"
pause
