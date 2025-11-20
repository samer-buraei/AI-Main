@echo off
title Vibecoding MCP Server
cd /d "%~dp0vibecoding-mcp-server"
echo ========================================
echo   Vibecoding MCP Server
echo ========================================
echo.
echo Starting on port 4001...
echo.
npm run dev
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] MCP Server failed to start
  echo.
  pause
)
