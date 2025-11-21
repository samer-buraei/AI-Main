# FireSwarm Simulation Environment

## 1. Setup X11 Display (Windows only)
Because Gazebo is a Linux GUI application running inside Docker, it needs an "X Server" on Windows to display its window.

1. **Install VcXsrv**: [Download from SourceForge](https://sourceforge.net/projects/vcxsrv/)
2. **Launch VcXsrv** (XLaunch) with these **EXACT** settings:
   - **Display settings**: Multiple windows (default)
   - **Display number**: -1 (default)
   - **Client startup**: Start no client (default)
   - **Extra settings**: ✅ **Disable access control** (You MUST check this box!)

## 2. Run Simulation
Run the PowerShell script:
```powershell
.\start-simulation.ps1
```

## 3. What to Expect
1. A **Gazebo** window should pop up (3D drone simulation).
2. A **MAVProxy** map and console might pop up (or fail gracefully if libraries missing).
3. The terminal will show `MAV>`.

## 4. Troubleshooting
If no window appears:
- Did you check **"Disable access control"** in VcXsrv?
- Is your Firewall blocking VcXsrv?
- Try running `.\debug-gui.ps1` to test the connection.

## 5. Connecting QGroundControl
- The simulation exposes **TCP 5760** (internal) and **UDP 14550** (external).
- Open QGroundControl -> It should auto-connect to UDP port 14550.
