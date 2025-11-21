# ✅ QGroundControl Connection Test Guide

## 🎯 Quick Answer to Your Question

**YES!** QGroundControl should connect and you should be able to "drive" (control) the drone.

## 🔌 Connection Status Check

### What's Running:
- ✅ **ArduCopter SITL:** Running (Port 5760 listening)
- ✅ **Gazebo:** Running (GUI visible)
- ⚠️ **MAVProxy:** Needs to be running (Port 14550)
- ✅ **Port 14550:** Open on Windows (ready for QGroundControl)

### How to Connect QGroundControl:

1. **Open QGroundControl**

2. **Click Connection Icon** (top toolbar, looks like plug/antenna)

3. **Select Connection:**
   - **Type:** `UDP`
   - **Port:** `14550`
   - OR use: `TCP` → `127.0.0.1:14550`

4. **Click "Connect"**

5. **You Should See:**
   - HUD (Heads-Up Display) with drone attitude
   - Map view
   - Flight mode selector
   - Telemetry data

## 🎮 How to "Drive" the Drone

### Step 1: Arm the Drone
- In QGroundControl, find the **safety switch**
- Click to **ARM** the drone
- You should see status change to "ARMED"

### Step 2: Take Off
**Option A - Automatic:**
- Select flight mode: **"Takeoff"** or **"Auto"**
- Click "Takeoff" button
- Drone will automatically lift off

**Option B - Manual:**
- Select flight mode: **"Stabilize"** or **"Alt Hold"**
- Use **throttle stick** (move up) to increase altitude
- Use **pitch/roll sticks** to move forward/back/left/right

### Step 3: Watch in Gazebo
- **Gazebo window** shows the 3D simulation
- You'll see the drone move in real-time!
- Drone responds to your commands

### Step 4: Land
- Move throttle down (or use "Land" mode)
- Or click "Land" button in QGroundControl

## 🔄 Complete Control Flow

```
YOU (QGroundControl)
  ↓ Click "Arm"
  ↓ Click "Takeoff" or move throttle
  ↓
MAVProxy (Port 14550)
  ↓ MAVLink command
  ↓
ArduPilot SITL (Port 5760)
  ↓ Processes command
  ↓ Sends motor commands
  ↓
Gazebo (Physics)
  ↓ Applies physics
  ↓
DRONE MOVES IN 3D WORLD! 🚁
  ↓
Gazebo sends sensor data back
  ↓
ArduPilot processes
  ↓
MAVProxy forwards
  ↓
QGroundControl displays telemetry
```

## ⚠️ If QGroundControl Can't Connect

### Check 1: Is MAVProxy Running?
```powershell
docker exec fireswarm_sitl ps aux | grep mavproxy
```

If not running, start it:
```powershell
docker exec -d fireswarm_sitl bash -c "mavproxy.py --master tcp:127.0.0.1:5760 --out udp:0.0.0.0:14550 --retries 10 &"
```

### Check 2: Is Port 14550 Open?
```powershell
netstat -an | findstr "14550"
```

Should show: `UDP    0.0.0.0:14550`

### Check 3: Firewall Blocking?
- Windows Firewall might block QGroundControl
- Allow QGroundControl through firewall

### Check 4: Try Both UDP and TCP
- **UDP:** `localhost:14550` (recommended)
- **TCP:** `127.0.0.1:14550`

## 🎯 Expected Behavior

### When Connected:
- ✅ QGroundControl shows "Connected" status
- ✅ HUD displays drone attitude (artificial horizon)
- ✅ Map shows drone position
- ✅ Telemetry shows battery, GPS, altitude, etc.
- ✅ Flight mode selector works
- ✅ Commands (arm, takeoff, mode change) work

### When You Control:
- ✅ Gazebo window shows drone moving
- ✅ QGroundControl telemetry updates in real-time
- ✅ Drone responds to stick movements
- ✅ Flight modes change behavior

## 🐛 Troubleshooting

### "No Connection" Error:
1. Check MAVProxy is running
2. Check port 14550 is open
3. Try restarting simulation: `.\start-simulation.ps1`
4. Check firewall settings

### "No Heartbeat" Error:
- ArduCopter might not be fully connected to Gazebo
- Check ArduCopter logs: `docker logs fireswarm_sitl | grep -i error`
- Restart container: `docker restart fireswarm_sitl`

### "Commands Not Working":
- Make sure drone is ARMED
- Check flight mode is appropriate (Stabilize, Alt Hold, etc.)
- Verify ArduCopter-Gazebo connection is working

## 📝 Summary

**YES, QGroundControl should connect and you should be able to control the drone!**

The flow is:
1. **You** → QGroundControl (click buttons, move sticks)
2. **QGroundControl** → MAVProxy (sends MAVLink commands)
3. **MAVProxy** → ArduPilot (forwards commands)
4. **ArduPilot** → Gazebo (sends motor commands)
5. **Gazebo** → Physics simulation (drone moves)
6. **Gazebo** → ArduPilot (sends sensor data back)
7. **ArduPilot** → MAVProxy → QGroundControl (you see telemetry)

**Everything should work end-to-end!** 🎉

