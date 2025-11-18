# Troubleshooting Guide - Files to Share with LLM

## Problem
The `start-vibecoding.bat` launcher runs, flashes briefly, and closes without showing any output or starting services.

## Critical Files to Share

### 1. **start-vibecoding.bat** (MOST IMPORTANT)
**Why:** This is the main launcher script. It contains all the logic for:
- Detecting Node.js/npm
- Checking project directories
- Installing dependencies
- Starting services in separate windows
- Error handling

**Location:** Root directory

### 2. **vibecoding-backend/package.json**
**Why:** Contains the `npm run dev` script that the launcher tries to execute. Shows:
- What command actually runs when starting backend
- Dependencies required
- Port configuration (if any)

**Location:** `vibecoding-backend/package.json`

### 3. **vibecoding-dashboard/package.json**
**Why:** Contains the `npm start` script for the frontend. Shows:
- React start command
- Port configuration
- Dependencies

**Location:** `vibecoding-dashboard/package.json`

### 4. **vibecoding-mcp-server/package.json**
**Why:** Contains the `npm run dev` script for MCP server. Shows:
- Server start command
- Port configuration
- Dependencies

**Location:** `vibecoding-mcp-server/package.json`

### 5. **vibecoding-backend/src/server.js**
**Why:** Shows the actual server configuration:
- What port it listens on
- How it starts
- Any startup errors that might occur

**Location:** `vibecoding-backend/src/server.js`

## Additional Context to Provide

### System Information:
- Windows version: Windows 10
- Node.js version: (run `node --version` in cmd)
- npm version: (run `npm --version` in cmd)
- Whether Node.js is in PATH: (run `where node` in cmd)

### What Happens:
1. Double-click `start-vibecoding.bat`
2. Window flashes briefly (less than 1 second)
3. Window closes immediately
4. No error messages visible
5. No service windows open

### Possible Issues:
- Script exits early due to error (but error not visible because window closes)
- Node.js not found (but error handling should show message)
- Project directories missing
- Script syntax error
- PATH issues with Node.js

## Quick Diagnostic Commands

Run these in Command Prompt and share the output:

```cmd
where node
node --version
npm --version
cd "C:\Users\WIN 10\Desktop\AI Main"
dir
dir vibecoding-backend
dir vibecoding-dashboard
dir vibecoding-mcp-server
```

## Why These Files Matter

1. **start-vibecoding.bat** - The root cause is likely here. The script might be:
   - Exiting immediately due to an early error
   - Not waiting/pausing properly
   - Having issues with the `start` command for new windows
   - PATH issues with Node.js detection

2. **package.json files** - Verify the scripts exist and are correct. If `npm run dev` or `npm start` don't exist, the script will fail silently.

3. **server.js** - Check if there are any startup requirements or configuration issues.

## Recommended Fix Approach

The LLM should:
1. Add more pauses/delays to see where it fails
2. Add error logging to a file
3. Check if `start` command works properly
4. Verify all paths are correct
5. Add `pause` statements at critical points
6. Check if the script is being run from correct directory

