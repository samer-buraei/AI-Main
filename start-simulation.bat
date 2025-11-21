@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo   FireSwarm Simulation Launcher (Batch)
echo ==================================================

REM Check for help
if "%1"=="--help" (
    echo Usage: start-simulation.bat [options]
    echo.
    echo Options:
    echo   --test-build    Build image only, don't run simulation
    echo   --force-build   Force rebuild ignoring Docker cache
    echo   --help          Show this help message
    echo.
    echo Examples:
    echo   start-simulation.bat              # Normal run
    echo   start-simulation.bat --test-build # Test build only
    goto :eof
)

REM Navigate to the simulation directory relative to this script
cd /d "%~dp0simulation"

REM Pre-flight checks
echo [TEST] Checking Docker environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found. Please install Docker Desktop.
    echo         Download: https://www.docker.com/products/docker-desktop
    goto :error
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running.
    echo         Please start Docker Desktop and wait for it to initialize.
    goto :error
)

REM Check for docker-compose or docker compose
where docker-compose >nul 2>nul
if %errorlevel% equ 0 (
    set DOCKER_CMD=docker-compose
    set COMPOSE_TYPE=standalone
) else (
    docker compose version >nul 2>&1
    if %errorlevel% equ 0 (
        set DOCKER_CMD=docker compose
        set COMPOSE_TYPE=plugin
    ) else (
        echo [ERROR] Docker Compose not available.
        goto :error
    )
)

echo [OK] Docker environment ready. Using: %DOCKER_CMD% (%COMPOSE_TYPE%)

REM Check if image exists
docker images fireswarm_sitl:latest --format "{{.Repository}}:{{.Tag}}" 2>nul | findstr "fireswarm_sitl:latest" >nul
if %errorlevel% equ 0 (
    set IMAGE_EXISTS=1
    echo [INFO] Image 'fireswarm_sitl:latest' exists.
) else (
    set IMAGE_EXISTS=0
    echo [INFO] Image 'fireswarm_sitl:latest' not found.
)

REM Process arguments
set BUILD_ARGS=--build
if "%1"=="--test-build" (
    echo [MODE] Test Build Mode - Only building image, not running
    set BUILD_ARGS=build
    goto :build
)
if "%1"=="--force-build" (
    echo [MODE] Force Rebuild Mode - Ignoring cache
    set BUILD_ARGS=up --build --no-cache
    goto :build
)

REM Decide whether to build
if %IMAGE_EXISTS% equ 1 (
    echo [INFO] Using existing image. Skipping build.
    set BUILD_ARGS=up
) else (
    echo [INFO] Building image...
    set BUILD_ARGS=up --build
)

:build
REM Simple IP detection for X11 (needed for Windows -> Docker GUI)
if "%DISPLAY%"=="" (
    REM Try to grab the first IPv4 address found
    for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4 ^| findstr /v "127.0.0.1"') do (
        set IP=%%a
        goto :found_ip
    )
    :found_ip

    if "!IP!"=="" (
        echo [WARN] Could not detect IP address. GUI might not work.
        echo        Please set DISPLAY manually if needed.
    ) else (
        set DISPLAY=!IP!:0.0
        echo [INFO] DISPLAY not set. Auto-detected IP: !IP!
        echo [INFO] Setting DISPLAY=!DISPLAY!
    )
) else (
    echo [INFO] Using existing DISPLAY=%DISPLAY%
)

echo.
echo [IMPORTANT]
echo 1. Ensure an X Server (like VcXsrv) is running on Windows.
echo 2. Ensure "Disable access control" is checked in X Server settings.
echo.

echo [EXEC] Running: %DOCKER_CMD% %BUILD_ARGS%
%DOCKER_CMD% %BUILD_ARGS%

if %errorlevel% equ 0 (
    if "%1"=="--test-build" (
        echo.
        echo [SUCCESS] Build completed successfully!
        echo You can now run the simulation with: start-simulation.bat
    ) else (
        echo.
        echo [SUCCESS] Simulation started successfully!
        echo.
        echo Connection Details:
        echo   MAVLink (Primary): localhost:14550
        echo   MAVLink (Secondary): localhost:14551
        echo   Gazebo GUI: Should open automatically
        echo.
        echo Next Steps:
        echo   1. Connect QGroundControl to localhost:14550
        echo   2. Use 'docker logs fireswarm_sitl' to monitor logs
        echo   3. Press Ctrl+C to stop the simulation
    )
) else (
    echo.
    echo [ERROR] Command failed with exit code: %errorlevel%
    goto :troubleshoot
)

goto :end

:troubleshoot
echo.
echo Troubleshooting Options:
echo   1. Check logs: docker logs fireswarm_sitl
echo   2. Clean rebuild: start-simulation.bat --force-build
echo   3. Test build only: start-simulation.bat --test-build
echo   4. Docker cleanup: docker system prune -a
echo.
echo Recent container logs ^(if any^):
docker logs --tail 10 fireswarm_sitl 2>nul

:error
echo.
echo Script finished with errors.
pause
exit /b 1

:end
echo.
echo Script completed successfully.
pause

