@echo off
title Docker Image Size Monitor
color 0B

echo ========================================
echo   Docker Image Size Monitor
echo ========================================
echo.
echo Watching for: vibecoding images
echo.
echo Expected sizes when complete:
echo   vibecoding-backend:   ~180 MB
echo   vibecoding-frontend:  ~450 MB
echo   vibecoding-mcp:       ~150 MB
echo.
echo ========================================
echo.

:loop
echo [%TIME%] Current Docker Images:
echo.
docker images | findstr "vibecoding"
if errorlevel 1 (
    echo [INFO] No vibecoding images found yet...
    echo       Build is still in progress
)
echo.
docker images | findstr "REPOSITORY"
echo ----------------------------------------
echo.
echo Total Docker usage:
docker system df -v | findstr "Images"
echo.
echo ========================================
echo Refreshing in 10 seconds...
echo Press Ctrl+C to stop
echo ========================================
timeout /t 10 /nobreak >nul
cls
goto loop

