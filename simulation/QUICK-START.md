# 🚀 Quick Start Guide - FireSwarm Simulation

## ⚡ Fastest Way to Start

### One Command to Rule Them All:

```powershell
.\go-simulation.ps1
```

**That's it!** The script handles everything:
- ✅ Checks Docker
- ✅ Starts VcXsrv (X Server)
- ✅ Builds image (first time only)
- ✅ Starts all components
- ✅ Shows status

---

## 📋 Prerequisites (One-Time Setup)

### 1. Install Docker Desktop
- Download: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop
- Verify: `docker --version`

### 2. Install VcXsrv (X Server)
- Download: https://sourceforge.net/projects/vcxsrv/
- Install normally
- **Note:** `go-simulation.ps1` can auto-start it, but you can also start manually

---

## 🎮 Daily Usage

### Start Simulation
```powershell
.\go-simulation.ps1
```

### Check Status
```powershell
.\go-simulation.ps1 -Status
```

### Restart Simulation
```powershell
.\go-simulation.ps1 -Restart
```

### Stop Simulation
```powershell
.\go-simulation.ps1 -Stop
```

### Show Help
```powershell
.\go-simulation.ps1 -Help
```

---

## 🔌 Connect QGroundControl

1. **Open QGroundControl**
2. **Click connection icon** (top toolbar)
3. **Select:** `UDP` → Port `14550`
4. **Click "Connect"**

You should see:
- ✅ HUD (Heads-Up Display)
- ✅ Map view
- ✅ Telemetry data
- ✅ Flight mode selector

---

## 🎯 Control the Drone

### Via QGroundControl:
1. **Arm:** Click safety switch → ARM
2. **Takeoff:** Select "Takeoff" mode or use throttle stick
3. **Control:** Use sticks or buttons
4. **Watch:** See drone move in Gazebo window!

### Via Python Scripts:
```powershell
# Automatic flight sequence
docker exec fireswarm_sitl python3 /home/ardupilot/workspace/fly-drone.py

# Direct RC control
docker exec fireswarm_sitl python3 /home/ardupilot/workspace/drive-drone-direct.py
```

---

## 🐛 Troubleshooting

### Problem: "Docker is not running"
**Fix:** Start Docker Desktop

### Problem: "VcXsrv not found"
**Fix:** Install VcXsrv or start it manually

### Problem: Gazebo GUI doesn't appear
**Fix:** 
1. Run `.\go-simulation.ps1 -Restart`
2. Or run `.\debug-gui.ps1` to fix VcXsrv

### Problem: QGroundControl can't connect
**Fix:**
1. Check simulation is running: `.\go-simulation.ps1 -Status`
2. Verify port 14550 is open: `netstat -an | findstr 14550`
3. Try restarting: `.\go-simulation.ps1 -Restart`

---

## 📚 More Information

- **Complete Documentation:** `simulation/HANDOVER-DOCUMENTATION.md`
- **Current Status:** `simulation/CURRENT-STATUS.md`
- **Connection Details:** `simulation/HOW-IT-WORKS.md`
- **QGroundControl Setup:** `simulation/QGROUNDCONTROL-SETUP.md`

---

## ✅ Checklist for First Run

- [ ] Docker Desktop installed and running
- [ ] VcXsrv installed (or let script auto-start it)
- [ ] Run `.\go-simulation.ps1`
- [ ] Wait for Gazebo window to appear
- [ ] Install QGroundControl (optional)
- [ ] Connect QGroundControl to UDP:14550
- [ ] Test drone control

**You're ready to go!** 🎉

