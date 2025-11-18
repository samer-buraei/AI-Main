# Vibecoding Launcher Options

## 🚀 Quick Start (Recommended)

```batch
start-vibecoding-smart.bat
```

This smart launcher detects your system and recommends the best option.

---

## 📋 Available Launchers

### 1. **start-vibecoding-smart.bat** (RECOMMENDED)
**Auto-detects best method and lets you choose**

- Checks if Docker is available
- Checks if npm dependencies are installed
- Recommends Docker if available (faster, no Windows errors)
- Falls back to Node.js direct if Docker not available

**Use when:** You want the best experience with minimal hassle

---

### 2. **start-vibecoding-docker.bat** (BEST FOR DEVELOPMENT)
**Uses Docker containers**

**Pros:**
- ✅ **10x faster** subsequent starts (10-30 seconds)
- ✅ **No Windows filesystem errors** (TAR_ENTRY_ERROR, path limits)
- ✅ **Isolated environment** (no conflicts with other projects)
- ✅ **Production-ready** setup
- ✅ **Easy cleanup** (`docker-compose down`)
- ✅ **Consistent** across all machines

**Cons:**
- ⚠️ Requires Docker Desktop installed
- ⚠️ First build takes 2-3 minutes
- ⚠️ Uses more disk space (Docker images)

**Requirements:**
- Docker Desktop installed and running
- 4GB+ RAM available for Docker

**Use when:** You have Docker and want the best development experience

---

### 3. **start-vibecoding.bat** (TRADITIONAL)
**Direct Node.js execution**

**Pros:**
- ✅ No Docker required
- ✅ Direct access to source code
- ✅ Easier debugging
- ✅ Lower disk space usage

**Cons:**
- ⚠️ First install takes 5-10 minutes
- ⚠️ May encounter Windows filesystem errors
- ⚠️ Path length limit issues (260 characters)
- ⚠️ Antivirus may slow down npm install

**Requirements:**
- Node.js v24.x installed
- npm v11.x installed

**Use when:** You don't have Docker or need direct Node.js access

---

### 4. **fix-npm-errors.bat** (TROUBLESHOOTING)
**Fixes Windows filesystem errors**

**What it does:**
1. Stops all Node processes
2. Cleans npm cache
3. Removes all node_modules folders
4. Deletes package-lock files
5. Performs fresh clean installation

**Use when:**
- Getting `TAR_ENTRY_ERROR` or `ENOENT` errors
- npm install is corrupted or incomplete
- Installation seems stuck
- Previous install was interrupted

**Time:** 10-15 minutes for complete clean reinstall

---

## 🔧 Stopping Services

### Docker:
```batch
stop-vibecoding-docker.bat
```
or
```batch
docker-compose down
```

### Node.js Direct:
Just close the three terminal windows (Backend, Frontend, MCP Server)

---

## 🐛 Current Error Analysis

### The Errors You're Seeing:
```
npm warn tar TAR_ENTRY_ERROR ENOENT: no such file or directory...
```

**What this means:**
- Windows 260-character path limit exceeded
- Antivirus or Windows Search locking files
- npm trying to update files that are locked or too deeply nested

**Why Docker solves this:**
- Docker uses **Linux filesystem** inside containers
- No 260-character path limits
- No Windows file locking issues
- node_modules stored in **Docker volumes** (not Windows filesystem)
- Faster file operations

---

## 📊 Performance Comparison

| Method | First Run | Subsequent Runs | Filesystem Errors | Isolation |
|--------|-----------|-----------------|-------------------|-----------|
| **Docker** | 2-3 min | **10-30 sec** | **None** | **Excellent** |
| **Node.js** | 5-10 min | 30 sec | **Frequent** | None |
| **Fix + Node.js** | 10-15 min | 30 sec | Sometimes | None |

---

## 🎯 Recommended Workflow

### If You Have Docker (You Do! Docker 28.5.2):

1. **First Time:**
   ```batch
   start-vibecoding-docker.bat
   ```
   Wait 2-3 minutes for Docker images to build

2. **Every Time After:**
   ```batch
   start-vibecoding-docker.bat
   ```
   Services start in 10-30 seconds!

3. **When Done:**
   ```batch
   stop-vibecoding-docker.bat
   ```

### If You Don't Have Docker:

1. **First Time:**
   ```batch
   fix-npm-errors.bat  (if you have errors)
   ```
   or
   ```batch
   start-vibecoding.bat
   ```

2. **If You Get Errors:**
   ```batch
   fix-npm-errors.bat
   ```

3. **Consider Installing Docker:**
   - Download: https://www.docker.com/products/docker-desktop/
   - Will save you hours of frustration!

---

## 🔍 Docker Commands Reference

### View running containers:
```batch
docker ps
```

### View logs (all services):
```batch
docker-compose logs -f
```

### View logs (specific service):
```batch
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mcp-server
```

### Restart services:
```batch
docker-compose restart
```

### Rebuild images (after code changes):
```batch
docker-compose up --build -d
```

### Stop and remove everything:
```batch
docker-compose down -v
```

### Check Docker status:
```batch
docker info
```

---

## 🆘 Troubleshooting

### Problem: "Docker is not running"
**Solution:** Start Docker Desktop from Start Menu or System Tray

### Problem: "Port already in use"
**Solution:** 
```batch
# Stop conflicting services
docker-compose down
# Or change ports in docker-compose.yml
```

### Problem: npm errors with Node.js direct
**Solution:**
```batch
fix-npm-errors.bat
```
or switch to Docker:
```batch
start-vibecoding-docker.bat
```

### Problem: Docker build fails
**Solution:**
1. Check Docker Desktop has enough memory (Settings > Resources > Memory)
2. Check disk space
3. Restart Docker Desktop

### Problem: Services not accessible
**Solution:**
```batch
# Check if containers are running
docker ps

# Check logs for errors
docker-compose logs

# Restart services
docker-compose restart
```

---

## 💡 Tips

1. **Use Docker for development** - It's faster and more reliable
2. **Keep Docker Desktop running** - Minimal resource usage when idle
3. **Use `docker-compose logs -f`** to monitor services
4. **Don't mix methods** - Use either Docker OR Node.js direct, not both at once
5. **Clean up** Docker volumes periodically: `docker system prune -a --volumes`

---

## 📦 What Gets Installed

### With Node.js Direct:
- Backend: ~220 packages
- Frontend: ~1400 packages
- MCP Server: ~packages
- **Total: ~5-10 minutes first time**

### With Docker:
- 3 Docker images with all dependencies
- **First build: 2-3 minutes**
- **Subsequent starts: 10-30 seconds**

---

## 🎉 Success Indicators

After successful start, you should see:
- ✅ Three terminal windows (or Docker containers running)
- ✅ Backend API: http://localhost:4000
- ✅ Frontend: http://localhost:3000 (opens in browser)
- ✅ MCP Server: http://localhost:4001

---

## 📝 Files Overview

```
vibecoding/
├── start-vibecoding-smart.bat      ← Smart launcher (use this!)
├── start-vibecoding-docker.bat     ← Docker launcher
├── start-vibecoding.bat            ← Node.js direct launcher
├── stop-vibecoding-docker.bat      ← Stop Docker services
├── fix-npm-errors.bat              ← Fix filesystem errors
├── docker-compose.yml              ← Docker configuration
├── Dockerfile.backend              ← Backend Docker image
├── Dockerfile.frontend             ← Frontend Docker image
├── Dockerfile.mcp                  ← MCP Server Docker image
└── .dockerignore                   ← Docker ignore file
```

---

**Need Help?** Check `launcher-debug.log` for detailed execution logs.

