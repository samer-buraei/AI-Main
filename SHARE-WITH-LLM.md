# Files to Share with LLM for Troubleshooting

## Problem Summary
`start-vibecoding.bat` flashes and closes immediately without showing any output or starting services.

## MUST SHARE THESE FILES:

### 1. **start-vibecoding.bat** ⭐ CRITICAL
**Why:** This is the main launcher. The issue is likely here - script exits too early or has syntax/logic error.

### 2. **vibecoding-backend/package.json**
**Why:** Shows `npm run dev` uses `nodemon src/server.js`. If nodemon isn't installed, it fails silently.

### 3. **vibecoding-dashboard/package.json**  
**Why:** Shows `npm start` uses `react-scripts start`. Standard React setup.

### 4. **vibecoding-mcp-server/package.json**
**Why:** Shows `npm run dev` uses `nodemon src/mcp-server.js`.

## Key Information:

### Scripts Being Called:
- Backend: `npm run dev` → `nodemon src/server.js`
- Frontend: `npm start` → `react-scripts start`  
- MCP Server: `npm run dev` → `nodemon src/mcp-server.js`

### Likely Issues:
1. **Window closes before errors are visible** - Need to add `pause` or redirect output to file
2. **Node.js not found** - Script exits early in detection phase
3. **Missing dependencies** - `nodemon` might not be installed (dev dependency)
4. **Script syntax error** - Batch file might have invalid syntax
5. **PATH issues** - Node.js found but `npm` not accessible

### What the Script Does:
1. Checks for Node.js (scans multiple locations)
2. Checks for npm
3. Verifies project directories exist
4. Installs dependencies if `node_modules` missing
5. Starts 3 services in separate windows using `start "Title" cmd /k "command"`

### The Problem:
The `start` command opens new windows, but if the script exits immediately, those windows might close too. The script should wait/pause, but it's not working.

## What LLM Should Check:

1. **Add logging to file:**
   ```batch
   echo Starting... >> launcher.log
   ```

2. **Add pause at start:**
   ```batch
   echo Press any key to start...
   pause >nul
   ```

3. **Check if `start` command works:**
   - Test: `start "Test" cmd /k "echo Test && pause"`

4. **Verify Node.js detection:**
   - Add `echo Node found: %NODE_FOUND%` after detection

5. **Check exit codes:**
   - Add `echo Exit code: %ERRORLEVEL%` after each command

6. **Redirect errors:**
   ```batch
   command 2>&1 | tee error.log
   ```

## Quick Test:
Run this manually in CMD to see if Node.js is found:
```cmd
cd "C:\Users\WIN 10\Desktop\AI Main"
where node
node --version
```

If these work, the issue is in the batch script logic, not Node.js installation.

