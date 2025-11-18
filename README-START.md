# Quick Start Guide

## Windows Launcher Scripts

### Option 1: GUI Launcher (Easiest!)
Right-click **`start-vibecoding-gui.ps1`** and select "Run with PowerShell" for a graphical interface.

If you get an execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

The GUI lets you:
- Select which services to start
- Start/Stop services with buttons
- Open the dashboard in your browser
- See status updates

### Option 2: Batch File (Simple)
Double-click **`start-vibecoding.bat`** to start all services.

This will:
- Check if Node.js is installed
- Install dependencies if needed
- Start all three services in separate windows:
  - Backend API (port 4000)
  - Frontend Dashboard (port 3000)
  - MCP Server (port 4001)

### Option 3: PowerShell Script (Command Line)
Right-click **`start-vibecoding.ps1`** and select "Run with PowerShell".

If you get an execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Stopping Services

### Option 1: Batch File
Double-click **`stop-vibecoding.bat`** to stop all services.

### Option 2: PowerShell Script
Run **`stop-vibecoding.ps1`** to stop all services.

### Manual Stop
Simply close all the command/PowerShell windows that were opened.

## Manual Start (Alternative)

If you prefer to start services manually:

### Terminal 1 - Backend
```bash
cd vibecoding-backend
npm install  # First time only
npm run dev
```

### Terminal 2 - Frontend
```bash
cd vibecoding-dashboard
npm install  # First time only
npm start
```

### Terminal 3 - MCP Server
```bash
cd vibecoding-mcp-server
npm install  # First time only
npm run dev
```

## First Time Setup

1. Make sure Node.js is installed: https://nodejs.org/
2. Run `start-vibecoding.bat` (it will install dependencies automatically)
3. Wait for all services to start
4. The frontend will open automatically in your browser

## Troubleshooting

### "Node.js is not installed"
- Download and install Node.js from https://nodejs.org/
- Restart your computer after installation
- Run the launcher again

### "Port already in use"
- Another application is using ports 3000, 4000, or 4001
- Stop those applications or change ports in `.env` files

### "Dependencies failed to install"
- Check your internet connection
- Try running `npm install` manually in each project folder
- Make sure you have write permissions

### Services won't start
- Make sure all three project folders exist
- Check that `package.json` files are present in each folder
- Review the error messages in the service windows

## Access Points

Once started, you can access:
- **Frontend Dashboard**: http://localhost:3000 (opens automatically)
- **Backend API**: http://localhost:4000
- **MCP Server**: http://localhost:4001

## Connecting Cursor IDE

1. Open Cursor IDE
2. Go to Settings > Tools & MCP
3. Under "MCP Servers," click "Add MCP Server"
4. Enter the URL: `http://localhost:4001`
5. Click Save

Now Cursor can use the MCP tools to interact with your projects!

