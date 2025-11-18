@echo off
title Upload to Git Repository
color 0B

echo ========================================
echo   Git Upload - Launcher
echo ========================================
echo.
echo Starting Git upload GUI...
echo.

REM Run PowerShell script with GUI
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0UPLOAD-TO-GIT.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   Upload process completed or cancelled
    echo ========================================
    echo.
    pause
)
