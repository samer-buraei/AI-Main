@echo off
title Vibecoding Frontend
cd /d "%~dp0vibecoding-dashboard"
echo ========================================
echo   Vibecoding Frontend Dashboard
echo ========================================
echo.
echo Starting on port 3000...
echo.
npm start
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Frontend failed to start
  echo.
  pause
)
