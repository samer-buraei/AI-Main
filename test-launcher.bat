@echo off
setlocal enabledelayedexpansion
title Test Launcher
color 0A
cls

echo Testing npm detection...
set NPM_FOUND=0
set NPM_VERSION=

where npm >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    set NPM_FOUND=1
    for /f "delims=" %%v in ('npm --version 2^>nul') do set NPM_VERSION=%%v
    if defined NPM_VERSION (
        echo [OK] npm found, version: !NPM_VERSION!
    ) else (
        echo [OK] npm found
    )
) else (
    echo [ERROR] npm not found
)

echo.
echo NPM_FOUND: !NPM_FOUND!
echo NPM_VERSION: !NPM_VERSION!
echo.
echo Test complete. Press any key to exit.
pause >nul

