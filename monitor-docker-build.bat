@echo off
title Docker Build Progress Monitor
color 0B

echo ========================================
echo   Docker Build Progress Monitor
echo ========================================
echo.
echo Expected Final Sizes:
echo   - Backend:    ~180 MB
echo   - Frontend:   ~450 MB (largest - React)
echo   - MCP Server: ~150 MB
echo   - TOTAL:      ~780 MB
echo.
echo ========================================
echo   Live Docker Disk Usage
echo ========================================
echo.

:loop
docker system df
echo.
echo ----------------------------------------
echo Refreshing in 5 seconds...
echo Press Ctrl+C to stop monitoring
echo ----------------------------------------
timeout /t 5 /nobreak >nul
cls
echo ========================================
echo   Docker Build Progress Monitor
echo ========================================
echo.
echo Expected Final Sizes:
echo   - Backend:    ~180 MB
echo   - Frontend:   ~450 MB (largest - React)
echo   - MCP Server: ~150 MB
echo   - TOTAL:      ~780 MB
echo.
echo Current Time: %TIME%
echo ========================================
echo   Live Docker Disk Usage
echo ========================================
echo.
goto loop

