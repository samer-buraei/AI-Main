# QGroundControl Connection Guide for FireSwarm Simulation

## 🔌 How Everything Connects

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  QGroundControl │◄───────┤  MAVProxy        │◄────────┤  ArduPilot SITL │
│  (GCS)          │ TCP    │  (Port 14550)    │ TCP     │  (Port 5760)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                    │
                                                                    │ MAVLink
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │  Gazebo Garden   │
                                                          │  (Physics Sim)   │
                                                          └──────────────────┘
```

## 📡 QGroundControl Connection Steps

### Option 1: Automatic Detection (Easiest)
1. **Open QGroundControl**
2. **Click "Q" menu** (top left) → **Application Settings**
3. **Go to Comm Links** tab
4. QGroundControl should **auto-detect** the connection on `localhost:14550`
5. If it appears, **click "Connect"**

### Option 2: Manual Connection (If auto-detect fails)

1. **Click "Q" menu** → **Application Settings** → **Comm Links** tab
2. **Click "Add"** button
3. **Select Connection Type:** `TCP`
4. **Enter Settings:**
   - **Name:** `FireSwarm SITL`
   - **TCP Server Address:** `127.0.0.1` (or `localhost`)
   - **TCP Server Port:** `14550`
5. **Click "OK"** then **"Connect"**

### Option 3: Quick Connect (Fastest)
1. **Click the connection icon** in the top toolbar (looks like a plug/antenna)
2. **Select:** `TCP: 127.0.0.1:14550`
3. **Click "Connect"**

## ✅ What You Should See After Connecting

- **HUD (Heads-Up Display):** Shows drone attitude, altitude, speed
- **Map View:** Shows drone position (if GPS is simulated)
- **Vehicle Setup:** Can configure parameters
- **Flight Modes:** Can switch between modes (Stabilize, Alt Hold, etc.)
- **Telemetry:** Battery, GPS status, etc.

## 🔧 Troubleshooting

### If QGroundControl can't connect:

1. **Check MAVProxy is running:**
   ```powershell
   docker logs fireswarm_sitl | findstr "MAVLink\|14550"
   ```

2. **Verify port is open:**
   ```powershell
   netstat -an | findstr "14550"
   ```

3. **Check firewall:** Windows Firewall might be blocking. Allow QGroundControl through firewall.

4. **Try UDP instead:** If TCP doesn't work, try:
   - Connection Type: `UDP`
   - Listening Port: `14550`

## 🎮 Controlling the Simulation

Once connected:
- **Arm the drone:** Use the safety switch in QGroundControl
- **Take off:** Use "Takeoff" command or manual throttle
- **Switch modes:** Use the flight mode selector
- **Watch in Gazebo:** The drone will move in the 3D view!

## 📝 Connection Details Summary

- **Protocol:** MAVLink v2
- **Connection:** TCP
- **Address:** `127.0.0.1` or `localhost`
- **Port:** `14550` (Primary), `14551` (Secondary)
- **Vehicle Type:** ArduCopter (Quadcopter)
- **Firmware:** ArduPilot SITL

