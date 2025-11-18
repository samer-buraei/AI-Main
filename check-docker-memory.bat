@echo off
title Docker Memory Check
color 0B

echo ========================================
echo   Docker Memory Configuration Check
echo ========================================
echo.

REM Get memory in bytes
for /f "tokens=*" %%m in ('docker info --format "{{.MemTotal}}"') do set DOCKER_MEM_BYTES=%%m

REM Convert to GB (rough calculation)
set /a DOCKER_MEM_GB=%DOCKER_MEM_BYTES% / 1073741824

echo Current Docker Memory Allocation:
echo   Bytes: %DOCKER_MEM_BYTES%
echo   GB:    ~%DOCKER_MEM_GB% GB
echo.

REM Recommendations based on system size
echo ========================================
echo   Memory Recommendations
echo ========================================
echo.
echo System RAM ^| Docker Limit ^| Reasoning
echo -----------^|--------------^|--------------------------
echo  8 GB      ^|   3-4 GB     ^| Leave 4GB for Windows
echo 16 GB      ^|   6-8 GB     ^| Leave 8GB for Windows + apps
echo 32 GB      ^|  12-16 GB    ^| Can afford more headroom
echo.
echo Rule: Docker should use MAX 50%% of total RAM
echo.

REM Check if memory is in good range (5-9 GB is acceptable for 16GB system)
if %DOCKER_MEM_GB% LSS 5 (
    color 0C
    echo [ERROR] Memory is too low
    echo.
    echo Current:      ~%DOCKER_MEM_GB% GB
    echo Recommended:  6-8 GB for 16GB system
    echo Minimum:      5 GB
    echo.
    echo To increase:
    echo   1. Open Docker Desktop
    echo   2. Settings ^> Resources ^> Advanced
    echo   3. Set Memory slider to 6-8 GB
    echo   4. Click "Apply & Restart"
    echo   5. Wait for Docker to restart
    echo   6. Run this script again to verify
) else if %DOCKER_MEM_GB% LSS 10 (
    color 0A
    echo [OK] Memory allocation is OPTIMAL
    echo.
    echo Current:      ~%DOCKER_MEM_GB% GB
    echo Recommended:  6-8 GB for 16GB system
    echo.
    echo ✓ Good balance between Docker and Windows
    echo ✓ Enough for 3 Node.js services
    echo ✓ Room for Windows and other apps
) else (
    color 0E
    echo [WARNING] Memory allocation is HIGH
    echo.
    echo Current:      ~%DOCKER_MEM_GB% GB
    echo Recommended:  6-8 GB for 16GB system
    echo.
    echo Docker is using more than 50%% of system RAM!
    echo This may slow down Windows and other apps.
    echo.
    echo Consider reducing to 6-8 GB:
    echo   1. Open Docker Desktop
    echo   2. Settings ^> Resources ^> Advanced
    echo   3. Set Memory slider to 7 GB
    echo   4. Click "Apply & Restart"
)

echo.
echo ========================================
echo Press any key to close this window...
pause >nul

