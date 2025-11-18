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

echo Current Docker Memory:
echo   Bytes: %DOCKER_MEM_BYTES%
echo   GB:    ~%DOCKER_MEM_GB% GB
echo.

if %DOCKER_MEM_GB% LSS 10 (
    color 0E
    echo [WARNING] Memory is below recommended 12 GB
    echo.
    echo Current:      ~%DOCKER_MEM_GB% GB
    echo Recommended:  12 GB
    echo Minimum:      4 GB
    echo.
    echo To increase:
    echo   1. Open Docker Desktop
    echo   2. Settings ^> Resources ^> Advanced
    echo   3. Increase Memory slider to 12 GB
    echo   4. Click "Apply & Restart"
    echo   5. Wait for Docker to restart
    echo   6. Run this script again to verify
) else (
    color 0A
    echo [OK] Memory allocation is sufficient
    echo.
    echo Current:      ~%DOCKER_MEM_GB% GB
    echo Recommended:  12 GB
)

echo.
echo ========================================
pause

