# 🎮 How FireSwarm Simulation Works - Connection Flow

## 🔄 The Correct Flow (How It Should Work)

```
┌─────────────────┐
│ QGroundControl  │ ← YOU CONTROL FROM HERE
│  (Ground Station)│
└────────┬────────┘
         │ MAVLink Commands (UDP:14550)
         │ "Arm", "Takeoff", "Change Mode"
         ▼
┌─────────────────┐
│   MAVProxy      │ ← Communication Bridge
│  (Port 14550)   │
└────────┬────────┘
         │ MAVLink (TCP:5760)
         │ Forwards commands
         ▼
┌─────────────────┐         ┌─────────────────┐
│ ArduPilot SITL  │◄────────┤  Gazebo Garden  │
│  (Flight Ctrl)  │ MAVLink │  (Physics Sim) │
│                 │         │                 │
│ Processes:      │         │ Simulates:      │
│ - Flight modes  │         │ - Gravity       │
│ - Stabilization │         │ - Aerodynamics  │
│ - Motor control │         │ - Sensors       │
└────────┬────────┘         └─────────────────┘
         │
         │ Motor Commands
         │ "Spin motor 1 at 50%"
         ▼
    Gazebo applies physics
    Drone moves in 3D world
```

## ❌ Common Misconception

**WRONG:** "Gazebo runs ArduPilot"  
**CORRECT:** "ArduPilot runs separately, Gazebo provides physics"

## ✅ What Actually Happens

### 1. **ArduPilot SITL** (Flight Controller)
- **Runs:** As a separate process
- **Does:** Flight control algorithms, sensor processing, motor commands
- **Location:** `/home/ardupilot/ardupilot/build/sitl/bin/arducopter`
- **Connects to:** Gazebo via MAVLink (for sensor data)

### 2. **Gazebo Garden** (Physics Simulator)
- **Runs:** As a separate process
- **Does:** 3D physics, gravity, collisions, sensor simulation
- **Connects to:** ArduPilot via `ardupilot_gazebo` plugin
- **Shows:** 3D visualization (the window you see)

### 3. **MAVProxy** (Communication Bridge)
- **Runs:** As a separate process
- **Does:** Routes MAVLink messages between components
- **Connects:** ArduPilot ↔ QGroundControl
- **Port:** 14550 (UDP) for QGroundControl

### 4. **QGroundControl** (Ground Station)
- **Runs:** On your Windows computer (outside Docker)
- **Does:** User interface, telemetry display, command sending
- **Connects to:** MAVProxy on `localhost:14550`

## 🎮 How You "Drive" the Drone

### Step-by-Step Control Flow:

1. **You click "Arm" in QGroundControl**
   ```
   QGroundControl → MAVLink Command → MAVProxy → ArduPilot
   ```

2. **ArduPilot processes command**
   ```
   ArduPilot: "OK, arming motors..."
   ```

3. **ArduPilot sends motor commands to Gazebo**
   ```
   ArduPilot → MAVLink → Gazebo: "Set motor speeds"
   ```

4. **Gazebo applies physics**
   ```
   Gazebo: "Motors spinning, applying thrust, drone lifts off"
   ```

5. **Gazebo sends sensor data back**
   ```
   Gazebo → MAVLink → ArduPilot: "Current altitude: 1.5m, attitude: level"
   ```

6. **ArduPilot adjusts (stabilization)**
   ```
   ArduPilot: "Drone tilting left, increase right motor speed"
   ```

7. **You see it in Gazebo window**
   ```
   Drone moves in 3D view!
   ```

8. **Telemetry flows back to QGroundControl**
   ```
   ArduPilot → MAVProxy → QGroundControl: "Altitude: 1.5m, Speed: 0.2 m/s"
   ```

## 🔌 Current Connection Status

Let me check what's actually connected:

