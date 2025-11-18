@echo off
setlocal enabledelayedexpansion
title Dependency Audit & Update Check
color 0B

echo ========================================
echo   Dependency Audit ^& Update Tool
echo ========================================
echo.

set "REPORT_FILE=%~dp0dependency-report.txt"
echo Dependency Report - %DATE% %TIME% > "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Function to check each project
call :check_project "vibecoding-backend" "Backend"
call :check_project "vibecoding-dashboard" "Frontend"
call :check_project "vibecoding-mcp-server" "MCP Server"

echo.
echo ========================================
echo   Summary Complete
echo ========================================
echo.
echo Full report saved to: %REPORT_FILE%
echo.
echo Next steps:
echo   1. Review the report above
echo   2. Run 'npm update' in each folder to update minor versions
echo   3. For major updates, use 'npm install package@latest'
echo   4. Test after each update!
echo.
pause
exit /b 0

:check_project
set "PROJECT_DIR=%~1"
set "PROJECT_NAME=%~2"

echo.
echo ========================================
echo   Checking %PROJECT_NAME%
echo ========================================
echo. >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo %PROJECT_NAME% >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"

if not exist "%PROJECT_DIR%" (
    echo [ERROR] Directory not found: %PROJECT_DIR%
    echo [ERROR] Directory not found: %PROJECT_DIR% >> "%REPORT_FILE%"
    goto :eof
)

cd "%PROJECT_DIR%"

echo.
echo [1/3] Checking for outdated packages...
echo. >> "%REPORT_FILE%"
echo [OUTDATED PACKAGES] >> "%REPORT_FILE%"
npm outdated >> "%REPORT_FILE%" 2>&1
if errorlevel 1 (
    echo [INFO] Some packages are outdated (see report)
) else (
    echo [OK] All packages up to date
)

echo.
echo [2/3] Running security audit...
echo. >> "%REPORT_FILE%"
echo [SECURITY AUDIT] >> "%REPORT_FILE%"
npm audit --audit-level=moderate >> "%REPORT_FILE%" 2>&1
if errorlevel 1 (
    echo [WARNING] Security vulnerabilities found (see report)
) else (
    echo [OK] No security vulnerabilities
)

echo.
echo [3/3] Checking for deprecated packages...
echo. >> "%REPORT_FILE%"
echo [DEPRECATED PACKAGES] >> "%REPORT_FILE%"
npm list --depth=0 >> "%REPORT_FILE%" 2>&1

cd ..
goto :eof

