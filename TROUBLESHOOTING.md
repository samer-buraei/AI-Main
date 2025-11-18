# Troubleshooting Guide

## Services Won't Start

### Step 1: Run Diagnostic Script
First, run the diagnostic script to identify the issue:
```powershell
.\test-services.ps1
```

This will check:
- Node.js installation
- npm availability
- Project directories
- package.json files
- node_modules

### Step 2: Common Issues and Fixes

#### Issue: "Node.js is not installed"
**Fix:**
1. Download Node.js from https://nodejs.org/
2. Install it
3. Restart your computer
4. Open a new terminal and try again

#### Issue: "npm command not found"
**Fix:**
1. Node.js should include npm
2. Restart your terminal/computer after installing Node.js
3. Verify: `npm --version` should work

#### Issue: "Directory not found"
**Fix:**
1. Make sure you're running the script from the root directory (where `start-vibecoding.bat` is)
2. Verify these folders exist:
   - `vibecoding-backend`
   - `vibecoding-dashboard`
   - `vibecoding-mcp-server`

#### Issue: "package.json not found"
**Fix:**
1. The project structure might be incomplete
2. Re-download or recreate the project files
3. Make sure all files from the implementation are present

#### Issue: "Dependencies failed to install"
**Fix:**
1. Check your internet connection
2. Try installing manually:
   ```bash
   cd vibecoding-backend
   npm install
   cd ../vibecoding-dashboard
   npm install
   cd ../vibecoding-mcp-server
   npm install
   ```
3. If npm install fails, check the error message
4. Common causes:
   - No internet connection
   - Firewall blocking npm
   - Antivirus blocking npm
   - Disk space full

#### Issue: "Port already in use"
**Fix:**
1. Another application is using ports 3000, 4000, or 4001
2. Find and stop the process:
   ```powershell
   # Find process using port 4000
   netstat -ano | findstr :4000
   
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```
3. Or change ports in `.env` files

#### Issue: "npm run dev failed"
**Fix:**
1. Check the error message in the service window
2. Common causes:
   - Missing dependencies (run `npm install`)
   - Syntax error in code
   - Missing `.env` file
   - Database file locked

#### Issue: GUI Launcher Not Working
**Fix:**
1. Make sure PowerShell execution policy allows scripts:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
2. Try the batch file instead: `start-vibecoding.bat`
3. Check Windows Event Viewer for errors

### Step 3: Manual Start (For Debugging)

Start each service manually to see error messages:

**Terminal 1 - Backend:**
```bash
cd vibecoding-backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd vibecoding-dashboard
npm install
npm start
```

**Terminal 3 - MCP Server:**
```bash
cd vibecoding-mcp-server
npm install
npm run dev
```

This will show you the exact error messages.

### Step 4: Check Logs

Look for error messages in:
1. The service windows (they stay open)
2. Console output
3. Any error dialogs

### Step 5: Verify Environment Files

Make sure `.env` files exist (or copy from `.env.example`):

**Backend:**
```
PORT=4000
NODE_ENV=development
```

**Frontend:**
```
REACT_APP_API_URL=http://localhost:4000/api
```

**MCP Server:**
```
MCP_PORT=4001
BACKEND_API_URL=http://localhost:4000/api
```

## Still Not Working?

1. **Check Node.js version**: Should be 16.x or higher
   ```bash
   node --version
   ```

2. **Check npm version**: Should be 8.x or higher
   ```bash
   npm --version
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

4. **Delete node_modules and reinstall**:
   ```bash
   # In each project folder
   rm -r node_modules
   rm package-lock.json
   npm install
   ```

5. **Check Windows Firewall**: May be blocking Node.js

6. **Run as Administrator**: Sometimes needed for port binding

7. **Check Antivirus**: May be blocking Node.js or npm

## Getting Help

If nothing works, provide:
1. Output from `test-services.ps1`
2. Error messages from service windows
3. Node.js version: `node --version`
4. npm version: `npm --version`
5. Windows version
6. Any error dialogs or messages


