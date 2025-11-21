# 🚀 Quick Start: Connect QGroundControl

## ✅ **SIMPLE 3-STEP PROCESS:**

### **Step 1: Open QGroundControl**
- Launch QGroundControl application

### **Step 2: Click Connection Icon**
- Look for the **connection icon** in the top toolbar (looks like a plug/antenna)
- OR click **"Q" menu** → **"Comm Links"**

### **Step 3: Select Connection**
Choose **ONE** of these (both work):

**Option A - UDP (Recommended):**
- Connection Type: **`UDP`**
- Listening Port: **`14550`**
- Click **"Connect"**

**Option B - TCP:**
- Connection Type: **`TCP`**
- Server Address: **`127.0.0.1`** or **`localhost`**
- Server Port: **`14550`**
- Click **"Connect"**

---

## 🎯 **What You Should See:**

✅ **HUD (Heads-Up Display)** - Shows drone attitude, altitude, speed  
✅ **Map View** - Shows drone position  
✅ **Vehicle Setup** - Can configure parameters  
✅ **Flight Modes** - Stabilize, Alt Hold, Loiter, etc.  
✅ **Telemetry** - Battery, GPS, sensors  

---

## 🔧 **If Connection Fails:**

1. **Check simulation is running:**
   ```powershell
   docker ps
   ```

2. **Check port is open:**
   ```powershell
   netstat -an | findstr "14550"
   ```

3. **Restart simulation:**
   ```powershell
   .\start-simulation.ps1
   ```

---

## 📡 **Connection Details:**

- **Protocol:** MAVLink v2
- **Port:** `14550` (Primary), `14551` (Secondary)  
- **Address:** `127.0.0.1` (localhost)
- **Vehicle:** ArduCopter (Quadcopter)
- **Firmware:** ArduPilot SITL

---

## 🎮 **Once Connected:**

1. **Arm the drone** - Use safety switch in QGroundControl
2. **Take off** - Use "Takeoff" command or manual throttle
3. **Watch in Gazebo** - The drone moves in the 3D view!
4. **Switch modes** - Use flight mode selector

**That's it!** 🎉

