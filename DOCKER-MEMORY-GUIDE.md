# Docker Memory Guide 🐳💾

## Quick Reference

### For Your 16GB System:

| Setting | Value | Why |
|---------|-------|-----|
| **Recommended Docker Memory** | **6-8 GB** | Optimal balance |
| **Minimum** | 5 GB | Services will be slow |
| **Maximum** | 8 GB | Don't exceed 50% of total RAM |

---

## ⚙️ How to Set Docker Memory

### Step 1: Open Docker Desktop
- Click Docker icon in System Tray (bottom-right)
- Click **Settings** (gear icon)

### Step 2: Navigate to Resources
- Left sidebar: **Resources** → **Advanced**

### Step 3: Adjust Memory
- Find the **Memory** slider
- Set to **7 GB** (sweet spot for 16GB system)
- Click **"Apply & Restart"**

### Step 4: Wait for Restart
- Docker Desktop will restart (30-60 seconds)
- Icon will show "Docker is starting..."
- Wait until it says "Docker Desktop is running"

---

## 📊 Memory Breakdown

### What Your Docker Containers Need:

| Service | Memory Usage | Notes |
|---------|--------------|-------|
| **Backend** | ~512 MB | Node.js API server |
| **Frontend** | ~2 GB | React compilation (heavy!) |
| **MCP Server** | ~512 MB | WebSocket server |
| **Docker Overhead** | ~1 GB | Container management |
| **npm install** | ~2 GB | Peak during first build |
| **Total** | **~6 GB** | Comfortable operation |

### Your System (16 GB):
- **Docker:** 7 GB (44%)
- **Windows:** 6 GB (38%)
- **Other Apps:** 3 GB (18%)
- ✅ **Balanced!**

---

## 🎯 Current Setup (Optimized)

### ✅ Already Lightweight!

Your Dockerfiles use **Alpine Linux** (`node:24-alpine`):
- **Regular Node.js image:** ~1 GB per service
- **Alpine image:** ~200 MB per service
- **Savings:** ~2.4 GB total! 🎉

### What This Means:
- ✅ Faster builds
- ✅ Less disk space
- ✅ Lower memory usage
- ✅ Same functionality

---

## 🛠️ Useful Commands

### Check Current Memory:
```batch
check-docker-memory.bat
```

### View Container Memory Usage:
```batch
docker stats
```

### View Image Sizes:
```batch
docker images
```

### Clean Up Old Images (Free Space):
```batch
docker system prune -a
```

---

## ❓ FAQ

### Q: Why not use all 16 GB for Docker?
**A:** Windows needs RAM too! If Docker uses >50%, your system will be slow.

### Q: What if I set it too low?
**A:** Services may crash or be very slow, especially React compilation.

### Q: What if I set it too high?
**A:** Windows will slow down, Chrome tabs will crash, everything lags.

### Q: Can I change it while containers are running?
**A:** Yes, but Docker will restart and stop all containers.

### Q: What's the smallest I can go?
**A:** 5 GB minimum, but React will be slow to compile.

---

## 🚀 Next Steps

1. Run `check-docker-memory.bat` to see current allocation
2. If not in 6-8 GB range, adjust in Docker Desktop
3. Run `start-vibecoding-docker.bat` to launch services
4. Monitor with `docker stats` if you notice slowness

---

## 📝 Global Rule Added

**New rule in `.cursorrules`:**
> **"Docker should NOT use more than 50% of system RAM"**

All future batch scripts will:
- ✅ Always have `pause` at the end (no more flashing!)
- ✅ Show memory warnings if allocation is too high/low
- ✅ Use Alpine Linux for lightweight Docker images
- ✅ Give clear troubleshooting steps

---

## 🎉 Summary

**Before:**
- ❌ 12 GB Docker (75% of RAM - too much!)
- ❌ Batch files flash closed
- ❌ No memory guidance

**After:**
- ✅ 6-8 GB Docker (40-50% - perfect!)
- ✅ All batch files have pause
- ✅ Clear memory recommendations
- ✅ Already using Alpine (lightweight)

**Your system will run smoothly now!** 🚀

