# 🎮 Simple Answer: Can You Control the Drone?

## ✅ YES! Here's How It Works:

### The Flow:
```
YOU (QGroundControl)
    ↓ Click "Arm", "Takeoff", move sticks
    ↓
MAVProxy (Port 14550)
    ↓ Forwards commands
    ↓
ArduPilot (Flight Controller)
    ↓ Processes & sends motor commands
    ↓
Gazebo (Physics Simulator)
    ↓ Applies physics
    ↓
DRONE MOVES! 🚁
```

## 🔌 To Connect QGroundControl:

1. **Open QGroundControl**

2. **Click connection icon** (top toolbar)

3. **Select:** `UDP: 14550` or `TCP: 127.0.0.1:14550`

4. **Click "Connect"**

5. **You should see:**
   - HUD with drone attitude
   - Telemetry data
   - Flight mode selector

## 🎮 To Control the Drone:

1. **Arm:** Click safety switch in QGroundControl
2. **Takeoff:** Use "Takeoff" button OR move throttle stick up
3. **Control:** Use sticks to move drone
4. **Watch:** See drone move in Gazebo window!

## ⚠️ Current Issue:

MAVProxy might not be running. If QGroundControl can't connect:

```powershell
# Restart the simulation
.\start-simulation.ps1
```

Or manually start MAVProxy:
```powershell
docker exec -d fireswarm_sitl bash -c "mavproxy.py --master tcp:127.0.0.1:5760 --out udp:0.0.0.0:14550 &"
```

## 📝 Summary:

**YES** - QGroundControl connects to MAVProxy, which connects to ArduPilot, which controls Gazebo. You can "drive" the drone from QGroundControl and see it move in Gazebo!

